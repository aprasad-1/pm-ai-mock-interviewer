'use server'

import { cookies } from 'next/headers'
import { adminAuth } from '@/firebase/admin'
import { 
  startInterviewTimer, 
  stopInterviewTimer, 
  getInterviewTime,
  periodicSync 
} from '@/lib/services/interviewTimer'

/**
 * Start tracking interview time for the current user
 */
export async function startTimer(): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return { success: false, message: 'Not authenticated' }
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid
    
    const started = await startInterviewTimer(userId)
    
    if (!started) {
      return { success: false, message: 'Failed to start timer. Check wallet balance.' }
    }
    
    return { success: true, message: 'Timer started' }
  } catch (error) {
    console.error('Error starting timer:', error)
    return { success: false, message: 'Failed to start timer' }
  }
}

/**
 * Stop tracking interview time and deduct from wallet
 */
export async function stopTimer(): Promise<{ success: boolean; secondsUsed: number }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return { success: false, secondsUsed: 0 }
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid
    
    const secondsUsed = await stopInterviewTimer(userId)
    
    return { success: true, secondsUsed }
  } catch (error) {
    console.error('Error stopping timer:', error)
    return { success: false, secondsUsed: 0 }
  }
}

/**
 * Get current interview time without stopping
 */
export async function getCurrentTime(): Promise<{ success: boolean; seconds: number }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return { success: false, seconds: 0 }
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid
    
    const seconds = getInterviewTime(userId)
    
    return { success: true, seconds }
  } catch (error) {
    console.error('Error getting current time:', error)
    return { success: false, seconds: 0 }
  }
}

/**
 * Sync interview time periodically
 */
export async function syncTimer(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return { success: false }
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid
    
    await periodicSync(userId)
    
    return { success: true }
  } catch (error) {
    console.error('Error syncing timer:', error)
    return { success: false }
  }
}
