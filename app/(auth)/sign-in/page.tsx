import React from 'react'
import AuthForm from '@/components/AuthForm'

interface SignInPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

const SignInPage = ({ searchParams }: SignInPageProps) => {
  const error = searchParams.error as string
  const message = searchParams.message as string

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              {message || 'Authentication required to access interviews'}
            </p>
          </div>
        )}
        <AuthForm type="sign-in" />
      </div>
    </div>
  )
}

export default SignInPage