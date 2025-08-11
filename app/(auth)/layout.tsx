import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'

const AuthLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await getCurrentUser()
  
  if (user) {
    redirect('/')
  }

  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}

export default AuthLayout