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

    if (!sessionCookie) {
      return null
    }

    // Verify session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedToken.uid

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      return null
    }

    const userData = userDoc.data()
    
    return {
      uid,
      email: userData?.email,
      name: userData?.name,
      photoURL: userData?.photoURL,
      createdAt: userData?.createdAt,
    }
  } catch (error) {
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
