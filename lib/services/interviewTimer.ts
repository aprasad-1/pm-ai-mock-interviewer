/**
 * Interview Timer Service
 * Tracks interview time to the second and syncs with database
 */

import { adminDb } from '@/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface InterviewTimerSession {
  userId: string
  startTime: number
  lastSyncTime: number
  totalSeconds: number
  isActive: boolean
}

// Store active sessions in memory (in production, use Redis)
const activeSessions = new Map<string, InterviewTimerSession>()

/**
 * Start tracking interview time for a user
 */
export async function startInterviewTimer(userId: string): Promise<boolean> {
  try {
    console.log(`⏱️ Starting interview timer for user: ${userId}`)
    
    // Check if user has minutes available
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      console.error('User not found:', userId)
      return false
    }
    
    const walletMinutes = userDoc.data()?.walletMinutes || 0
    if (walletMinutes <= 0) {
      console.error('User has no minutes available')
      return false
    }
    
    // Create or update session
    const session: InterviewTimerSession = {
      userId,
      startTime: Date.now(),
      lastSyncTime: Date.now(),
      totalSeconds: 0,
      isActive: true
    }
    
    activeSessions.set(userId, session)
    console.log(`✅ Interview timer started for user: ${userId}`)
    return true
  } catch (error) {
    console.error('Error starting interview timer:', error)
    return false
  }
}

/**
 * Stop tracking interview time and sync final time
 */
export async function stopInterviewTimer(userId: string): Promise<number> {
  try {
    const session = activeSessions.get(userId)
    if (!session) {
      console.log('No active session found for user:', userId)
      return 0
    }
    
    // Calculate total time used
    const now = Date.now()
    const sessionSeconds = Math.floor((now - session.startTime) / 1000)
    const totalSeconds = session.totalSeconds + sessionSeconds
    
    console.log(`⏹️ Stopping timer for user ${userId}. Total seconds: ${totalSeconds}`)
    
    // Sync final time to database
    await syncInterviewTime(userId, totalSeconds)
    
    // Remove session
    activeSessions.delete(userId)
    
    return totalSeconds
  } catch (error) {
    console.error('Error stopping interview timer:', error)
    return 0
  }
}

/**
 * Sync interview time to database (deduct from wallet)
 */
export async function syncInterviewTime(userId: string, secondsUsed: number): Promise<boolean> {
  try {
    if (secondsUsed <= 0) {
      console.log('No time to sync')
      return true
    }
    
    // Convert seconds to minutes (always round up)
    const minutesUsed = Math.ceil(secondsUsed / 60)
    
    console.log(`🔄 Syncing ${secondsUsed} seconds (${minutesUsed} minutes) for user ${userId}`)
    
    const userRef = adminDb.collection('users').doc(userId)
    
    // Use transaction for atomic update
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists) {
        throw new Error('User not found')
      }
      
      const currentMinutes = userDoc.data()?.walletMinutes || 0
      const newMinutes = Math.max(0, currentMinutes - minutesUsed)
      
      transaction.update(userRef, {
        walletMinutes: newMinutes,
        lastInterviewAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      console.log(`✅ Deducted ${minutesUsed} minutes. New balance: ${newMinutes}`)
    })
    
    // Update session
    const session = activeSessions.get(userId)
    if (session) {
      session.lastSyncTime = Date.now()
      session.totalSeconds = 0 // Reset after sync
    }
    
    return true
  } catch (error) {
    console.error('Error syncing interview time:', error)
    return false
  }
}

/**
 * Get current session time without stopping
 */
export function getInterviewTime(userId: string): number {
  const session = activeSessions.get(userId)
  if (!session || !session.isActive) {
    return 0
  }
  
  const now = Date.now()
  const sessionSeconds = Math.floor((now - session.startTime) / 1000)
  return session.totalSeconds + sessionSeconds
}

/**
 * Periodic sync for long interviews (call every 30 seconds)
 */
export async function periodicSync(userId: string): Promise<boolean> {
  try {
    const session = activeSessions.get(userId)
    if (!session || !session.isActive) {
      return false
    }
    
    const now = Date.now()
    const timeSinceLastSync = Math.floor((now - session.lastSyncTime) / 1000)
    
    if (timeSinceLastSync >= 30) {
      const sessionSeconds = Math.floor((now - session.startTime) / 1000)
      const secondsToSync = sessionSeconds - session.totalSeconds
      
      if (secondsToSync > 0) {
        await syncInterviewTime(userId, secondsToSync)
        session.totalSeconds = sessionSeconds
        session.lastSyncTime = now
      }
    }
    
    return true
  } catch (error) {
    console.error('Error in periodic sync:', error)
    return false
  }
}
