import React from 'react'
import AuthForm from '@/components/AuthForm'

// Temporary debug component for production troubleshooting
const DebugInfo = () => {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <h3 className="text-yellow-400 font-semibold mb-2">Debug Info (Production)</h3>
        <div className="text-xs text-yellow-300 space-y-1">
          <p>Firebase API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>Firebase Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
          <p>Firebase Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>Base URL: {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}</p>
        </div>
      </div>
    )
  }
  return null
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <DebugInfo />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-light-100">Start your interview practice journey</p>
        </div>
        <AuthForm type="sign-up" />
      </div>
    </div>
  )
}