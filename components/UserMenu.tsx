'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { clearSession } from '@/lib/actions/auth.action'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UserMenuProps {
  user: {
    uid: string
    email: string
    name: string
  }
}

const UserMenu = ({ user }: UserMenuProps) => {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await clearSession()
      toast.success('Signed out successfully!')
      // Redirect to sign-in page after successful logout
      router.push('/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-light-100">
        Welcome, <span className="text-white font-medium">{user.name}</span>
      </div>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="text-primary-200 border-primary-200 hover:bg-primary-200 hover:text-dark-100"
      >
        Sign Out
      </Button>
    </div>
  )
}

export default UserMenu
