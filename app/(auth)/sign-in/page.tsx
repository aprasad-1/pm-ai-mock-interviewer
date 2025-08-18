import React from 'react'
import AuthForm from '@/components/AuthForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm type="sign-in" />
      </div>
    </div>
  )
}