import React from 'react'
import AuthForm from '@/components/AuthForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-light-100">Sign in to continue practicing</p>
        </div>
        <AuthForm type="sign-in" />
      </div>
    </div>
  )
}