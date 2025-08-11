import React from 'react'
import AuthForm from '@/components/AuthForm'

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm type="sign-in" />
    </div>
  )
}

export default SignInPage