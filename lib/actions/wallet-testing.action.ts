'use server'

import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/firebase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Testing function to set wallet minutes to a specific amount
 * WARNING: REMOVE IN PRODUCTION - This is for testing only!
 * In production, wallet minutes should only be modified through proper payment flows
 */
export async function setWalletMinutes(minutes: number): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return { success: false, message: 'Not authenticated' }
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid
    
    await adminDb.collection('users').doc(userId).update({
      walletMinutes: Math.max(0, minutes),
      updatedAt: new Date().toISOString()
    })
    
    revalidatePath('/wallet-test')
    revalidatePath('/profile')
    
    console.log(`🧪 TEST: Set wallet to ${minutes} minutes for user ${userId}`)
    
    return { 
      success: true, 
      message: `Wallet set to ${minutes} minutes` 
    }
  } catch (error) {
    console.error('Error setting wallet minutes:', error)
    return { 
      success: false, 
      message: 'Failed to set wallet minutes' 
    }
  }
}

/**
 * Testing function to simulate different wallet states
 */
export async function simulateWalletState(state: 'empty' | 'low' | 'critical' | 'normal'): Promise<{ success: boolean; message: string }> {
  const minutes = {
    empty: 0,
    critical: 1,
    low: 5,
    normal: 30
  }
  
  return setWalletMinutes(minutes[state])
}
