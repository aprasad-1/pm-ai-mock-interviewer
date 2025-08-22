'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/firebase/admin'

export interface SignUpParams {
  uid: string
  name: string
  email: string
  photoURL?: string
}

export interface SignInParams {
  email: string
  idToken: string
}

export async function signUp({ uid, name, email, photoURL }: SignUpParams) {
  try {
    // Save user data to Firestore
    await adminDb.collection('users').doc(uid).set({
      name,
      email,
      photoURL: photoURL || null,
      subscriptionStatus: 'free',
      walletMinutes: 30, // Grant 30 free minutes on sign-up
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return { success: true, message: 'Account created successfully' }
  } catch (error) {
    throw new Error('Failed to create account. Please try again.')
  }
}

export async function signIn({ idToken }: SignInParams) {
  try {
    // Verify the ID token and create session cookie
    await adminAuth.verifyIdToken(idToken)
    // const uid = decodedToken.uid

    // Create session cookie (expires in 5 days)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
    })

    // Set the session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return { success: true, message: 'Signed in successfully' }
  } catch (error) {
    throw new Error('Failed to sign in. Please check your credentials.')
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    console.log('🔍 getCurrentUser debug:', {
      hasSessionCookie: !!sessionCookie,
      sessionCookieLength: sessionCookie?.length || 0,
      timestamp: new Date().toISOString()
    })

    if (!sessionCookie) {
      console.log('❌ No session cookie found')
      return null
    }

    // Verify session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedToken.uid

    console.log('✅ Session cookie verified for user:', uid)

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      console.log('❌ User document not found in Firestore:', uid)
      return null
    }

    const userData = userDoc.data()
    
    // Helper function to safely convert Firebase timestamp
    const convertTimestamp = (timestamp: any): string | null => {
      try {
        if (!timestamp) return null
        
        // Handle Firebase Timestamp object
        if (timestamp.seconds) {
          return new Date(timestamp.seconds * 1000).toISOString()
        }
        
        // Handle string timestamp
        if (typeof timestamp === 'string') {
          const date = new Date(timestamp)
          return isNaN(date.getTime()) ? null : date.toISOString()
        }
        
        // Handle Date object
        if (timestamp instanceof Date) {
          return isNaN(timestamp.getTime()) ? null : timestamp.toISOString()
        }
        
        return null
      } catch (error) {
        console.log('⚠️ Error converting timestamp:', error)
        return null
      }
    }

    const result = {
      uid,
      email: userData?.email,
      name: userData?.name,
      photoURL: userData?.photoURL,
      subscriptionStatus: userData?.subscriptionStatus || 'free',
      walletMinutes: userData?.walletMinutes ?? 0,
      stripeCustomerId: userData?.stripeCustomerId,
      createdAt: convertTimestamp(userData?.createdAt),
      updatedAt: convertTimestamp(userData?.updatedAt),
    }

    console.log('✅ getCurrentUser success for user:', uid, 'with data:', {
      email: result.email,
      subscriptionStatus: result.subscriptionStatus,
      walletMinutes: result.walletMinutes
    })

    return result
  } catch (error: any) {
    console.log('❌ getCurrentUser error:', error.message)
    return null
  }
}

export async function clearSession() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    
    return { success: true }
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.')
  }
}

export async function signOut() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.')
  }
  
  // Redirect outside of try-catch since redirect() throws internally
  redirect('/sign-in')
}
