import React from 'react'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { adminAuth } from '@/firebase/admin'

export default async function DebugAuthPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  
  let user = null
  let debugInfo: any = {
    hasSessionCookie: !!sessionCookie,
    sessionCookieLength: sessionCookie?.length || 0,
    sessionCookiePreview: sessionCookie?.substring(0, 50) || 'none'
  }

  try {
    user = await getCurrentUser()
    debugInfo.getCurrentUserResult = user ? 'success' : 'null'
  } catch (error: any) {
    debugInfo.getCurrentUserError = error.message
  }

  // Try to verify the session cookie directly
  if (sessionCookie) {
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
      debugInfo.sessionCookieValid = true
      debugInfo.decodedTokenUid = decodedToken.uid
      debugInfo.decodedTokenEmail = decodedToken.email
    } catch (error: any) {
      debugInfo.sessionCookieValid = false
      debugInfo.sessionCookieError = error.message
    }
  }

  return (
    <div className="min-h-screen bg-dark-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-light-100 mb-8">
          🔍 Authentication Debug Page
        </h1>
        
        <div className="space-y-6">
          {/* Current User Status */}
          <div className="bg-dark-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-light-100 mb-4">
              Current User Status
            </h2>
            {user ? (
              <div className="text-green-400">
                <p>✅ User is authenticated</p>
                <p>Email: {user.email}</p>
                <p>Name: {user.name}</p>
                <p>UID: {user.uid}</p>
                <p>Subscription: {user.subscriptionStatus}</p>
                <p>Wallet Minutes: {user.walletMinutes}</p>
              </div>
            ) : (
              <div className="text-red-400">
                <p>❌ User is NOT authenticated</p>
              </div>
            )}
          </div>

          {/* Debug Information */}
          <div className="bg-dark-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-light-100 mb-4">
              Debug Information
            </h2>
            <pre className="text-light-100 text-sm bg-dark-300 p-4 rounded overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* All Cookies */}
          <div className="bg-dark-200 rounded-lg p-6">
            <h2 className="text-xl font-semibent text-light-100 mb-4">
              All Cookies
            </h2>
            <div className="text-light-100 text-sm">
              {Array.from(cookieStore.getAll()).map((cookie) => (
                <div key={cookie.name} className="mb-2">
                  <strong>{cookie.name}:</strong> {cookie.value.substring(0, 100)}
                  {cookie.value.length > 100 && '...'}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-dark-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-light-100 mb-4">
              Actions
            </h2>
            <div className="space-y-2">
              <a 
                href="/sign-in" 
                className="inline-block bg-primary-200 text-dark-100 px-4 py-2 rounded hover:bg-primary-100"
              >
                Go to Sign In
              </a>
              <a 
                href="/" 
                className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 ml-4"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
