'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminAuth, adminDb } from '@/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { UserProfile } from '@/lib/types'
import { walletRateLimiter } from '@/lib/services/walletRateLimit'

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      throw new Error('Unauthorized')
    }

    // Verify session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedToken.uid

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    
    return {
      name: userData?.name || '',
      email: userData?.email || '',
      photoURL: userData?.photoURL,
      subscriptionStatus: userData?.subscriptionStatus || 'free',
      walletMinutes: userData?.walletMinutes ?? 0,
      stripeCustomerId: userData?.stripeCustomerId,
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw new Error('Failed to get user profile')
  }
}

export async function updateUserProfile(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return {
        message: 'Unauthorized - please sign in again',
        errors: {}
      }
    }

    // Verify session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedToken.uid

    const displayName = formData.get('displayName') as string
    
    if (!displayName || displayName.trim().length === 0) {
      return {
        message: 'Display name is required',
        errors: { displayName: ['Display name cannot be empty'] }
      }
    }

    if (displayName.trim().length < 2) {
      return {
        message: 'Display name must be at least 2 characters',
        errors: { displayName: ['Display name must be at least 2 characters'] }
      }
    }

    // Update user document in Firestore
    await adminDb.collection('users').doc(uid).update({
      name: displayName.trim(),
      updatedAt: new Date().toISOString(),
    })

    // Revalidate the profile page to show updated data
    revalidatePath('/profile')
    
    return { 
      message: 'Profile updated successfully',
      errors: {}
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return {
      message: 'Failed to update profile. Please try again.',
      errors: {}
    }
  }
}

export async function consumeWalletMinutes(userId: string, minutes: number): Promise<boolean> {
  try {
    const userRef = adminDb.collection('users').doc(userId)
    
    // Use transaction to ensure atomic update
    const result = await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists) {
        throw new Error('User not found')
      }
      
      const currentMinutes = userDoc.data()?.walletMinutes || 0
      
      if (currentMinutes < minutes) {
        throw new Error('Insufficient minutes in wallet')
      }
      
      const newMinutes = currentMinutes - minutes
      
      transaction.update(userRef, {
        walletMinutes: newMinutes,
        updatedAt: new Date().toISOString(),
      })
      
      return newMinutes
    })
    
    console.log(`✅ Consumed ${minutes} minutes for user ${userId}. Remaining: ${result}`)
    return true
  } catch (error) {
    console.error('Error consuming wallet minutes:', error)
    return false
  }
}

// New function to consume wallet time based on actual seconds used
export async function consumeWalletTime(userId: string, secondsUsed: number): Promise<boolean> {
  'use server'
  
  try {
    // Validate input
    if (secondsUsed <= 0) {
      console.log('⚠️ No time to consume (0 seconds)')
      return true
    }
    
    // Security: Cap maximum consumption to prevent abuse
    const MAX_SECONDS_PER_CALL = 3600 // 1 hour max per call
    if (secondsUsed > MAX_SECONDS_PER_CALL) {
      console.error(`⚠️ Attempted to consume ${secondsUsed} seconds, capping at ${MAX_SECONDS_PER_CALL}`)
      secondsUsed = MAX_SECONDS_PER_CALL
    }

    // Verify the user making the request matches the userId
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      console.error('❌ No session cookie found - unauthorized')
      return false
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    if (decodedToken.uid !== userId) {
      console.error(`❌ Security violation: User ${decodedToken.uid} attempting to modify wallet for user ${userId}`)
      return false
    }
    
    // Rate limiting check
    if (!walletRateLimiter.check(userId)) {
      console.error(`❌ Rate limit exceeded for user ${userId}`)
      return false
    }

    const userRef = adminDb.collection('users').doc(userId)
    
    // Store seconds used and convert to minutes for billing
    // We'll track actual seconds used and bill in minute increments
    const exactMinutes = secondsUsed / 60
    const minutesUsed = Math.ceil(exactMinutes) // Standard: any part of a minute counts as a full minute
    
    console.log(`🔄 Consuming ${minutesUsed} minutes (${secondsUsed}s = ${exactMinutes.toFixed(2)} exact minutes) for user ${userId}...`)
    
    const result = await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists) {
        throw new Error('User not found')
      }
      
      const currentMinutes = userDoc.data()?.walletMinutes || 0
      const currentSecondsUsed = userDoc.data()?.totalSecondsUsed || 0
      
      console.log(`📊 Current balance: ${currentMinutes}, Consuming: ${minutesUsed}`)
      
      // Allow consumption even if balance goes negative (for tracking)
      const newMinutes = Math.max(0, currentMinutes - minutesUsed)
      const newSecondsUsed = currentSecondsUsed + secondsUsed
      
      transaction.update(userRef, {
        walletMinutes: newMinutes,
        totalSecondsUsed: newSecondsUsed, // Track total seconds for analytics
        lastUsageAt: FieldValue.serverTimestamp(),
        updatedAt: new Date().toISOString(),
      })
      
      return newMinutes
    })
    
    console.log(`✅ Consumed ${minutesUsed} minutes (${secondsUsed}s) for user ${userId}. Remaining: ${result}`)
    return true
  } catch (error) {
    console.error('❌ Error consuming wallet time:', error)
    return false
  }
}

// Get current wallet balance
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      console.error('User not found:', userId)
      return 0
    }
    
    const walletMinutes = userDoc.data()?.walletMinutes || 0
    return walletMinutes
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    return 0
  }
}

export async function addWalletMinutes(userId: string, minutes: number): Promise<boolean> {
  try {
    console.log(`🔄 Adding ${minutes} minutes to user ${userId}'s wallet...`)
    
    const userRef = adminDb.collection('users').doc(userId)
    
    // First, get current balance to verify
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      console.error('❌ User document not found:', userId)
      return false
    }
    
    const currentBalance = userDoc.data()?.walletMinutes || 0
    console.log(`📊 Current balance: ${currentBalance} minutes`)
    
    await userRef.update({
      walletMinutes: FieldValue.increment(minutes),
      updatedAt: new Date().toISOString(),
    })
    
    // Verify the update
    const updatedDoc = await userRef.get()
    const newBalance = updatedDoc.data()?.walletMinutes || 0
    console.log(`✅ Added ${minutes} minutes to user ${userId}'s wallet. New balance: ${newBalance}`)
    
    return true
  } catch (error) {
    console.error('❌ Error adding wallet minutes:', error)
    return false
  }
}

// Admin function to add minutes to any user (for testing/admin purposes)
export async function adminAddWalletMinutes(userId: string, minutes: number): Promise<boolean> {
  try {
    // In production, you would add admin role verification here
    const userRef = adminDb.collection('users').doc(userId)
    
    await userRef.update({
      walletMinutes: FieldValue.increment(minutes),
      updatedAt: new Date().toISOString(),
    })
    
    console.log(`✅ Admin added ${minutes} minutes to user ${userId}'s wallet`)
    return true
  } catch (error) {
    console.error('Error adding wallet minutes:', error)
    return false
  }
}


