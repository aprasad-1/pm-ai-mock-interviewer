'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearSession } from '@/lib/actions/auth.action'
import { Button } from '@/components/ui/button'
import { User, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface UserMenuProps {
  user: {
    uid: string
    email: string
    name: string
    photoURL?: string
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
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <Image 
            src={user.photoURL} 
            alt="User profile" 
            width={32} 
            height={32} 
            className="rounded-full object-cover" 
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-400" />
          </div>
        )}
        <div className="text-xs sm:text-sm text-light-100">
          <span className="hidden sm:inline">Welcome, </span>
          <span className="text-white font-medium">{user.name}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-200 hover:bg-primary-200/10 min-h-[44px] text-xs sm:text-sm"
          >
            <Settings className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
        </Link>
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="text-primary-200 border-primary-200 hover:bg-primary-200 hover:text-dark-100 min-h-[44px] text-xs sm:text-sm whitespace-nowrap"
        >
          <span className="hidden md:inline">Sign Out</span>
          <span className="md:hidden">Sign Out</span>
        </Button>
      </div>
    </div>
  )
}

export default UserMenu
