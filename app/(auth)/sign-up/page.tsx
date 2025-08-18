import React from 'react'
import AuthForm from '@/components/AuthForm'

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <AuthForm type="sign-up" />
      </div>
    </div>
  )
}

export default SignUpPage