'use server'

import { adminDb } from '@/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * Reset monthly minutes for all Pro users
 * This should be run via a cron job on the 1st of each month
 */
export async function resetMonthlyMinutes(): Promise<{ success: boolean; usersUpdated: number; message: string }> {
  try {
    console.log('🔄 Starting monthly minute reset...')
    
    // Get all active Pro users
    const activeUsersSnapshot = await adminDb
      .collection('users')
      .where('subscriptionStatus', '==', 'active')
      .get()

    if (activeUsersSnapshot.empty) {
      console.log('✅ No active Pro users found')
      return { success: true, usersUpdated: 0, message: 'No active Pro users to reset' }
    }

    const batch = adminDb.batch()
    let updateCount = 0

    activeUsersSnapshot.forEach((doc) => {
      const userData = doc.data()
      
      // Only reset users who have monthly allocations
      if (userData.monthlyMinuteAllocation) {
        batch.update(doc.ref, {
          walletMinutes: userData.monthlyMinuteAllocation, // Reset to full allocation
          lastMonthlyReset: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
        
        updateCount++
        console.log(`- Resetting minutes for user: ${userData.email} (${userData.monthlyMinuteAllocation} minutes)`)
      }
    })

    await batch.commit()
    
    console.log(`✅ Successfully reset minutes for ${updateCount} Pro users`)
    
    // Log the reset for analytics
    await adminDb.collection('analytics').add({
      event: 'monthly_minutes_reset',
      usersUpdated: updateCount,
      timestamp: FieldValue.serverTimestamp(),
    })
    
    return { 
      success: true, 
      usersUpdated: updateCount, 
      message: `Reset minutes for ${updateCount} Pro users` 
    }
  } catch (error: any) {
    console.error('❌ Error resetting monthly minutes:', error)
    return { 
      success: false, 
      usersUpdated: 0, 
      message: error.message || 'Failed to reset monthly minutes' 
    }
  }
}

/**
 * Check if a user needs their monthly minutes reset
 */
export async function checkUserMonthlyReset(userId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return false
    }

    const userData = userDoc.data()
    
    // Only check Pro users
    if (userData?.subscriptionStatus !== 'active' || !userData?.monthlyMinuteAllocation) {
      return false
    }

    const lastReset = userData.lastMonthlyReset
    if (!lastReset) {
      // User has never been reset, reset them now
      await adminDb.collection('users').doc(userId).update({
        walletMinutes: userData.monthlyMinuteAllocation,
        lastMonthlyReset: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      return true
    }

    // Check if it's been more than a month since last reset
    let lastResetDate: Date
    try {
      lastResetDate = lastReset.seconds ? new Date(lastReset.seconds * 1000) : new Date(lastReset)
    } catch (error) {
      console.error('Error parsing lastReset date:', error)
      // If we can't parse the date, assume it needs reset
      lastResetDate = new Date(0) // Unix epoch, will trigger reset
    }
    
    const now = new Date()
    const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceReset >= 30) { // Reset every 30 days
      await adminDb.collection('users').doc(userId).update({
        walletMinutes: userData.monthlyMinuteAllocation,
        lastMonthlyReset: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      
      console.log(`🔄 Reset monthly minutes for user ${userId} (${daysSinceReset} days since last reset)`)
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking user monthly reset:', error)
    return false
  }
}
