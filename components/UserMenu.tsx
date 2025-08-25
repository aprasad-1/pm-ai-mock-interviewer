'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearSession } from '@/lib/actions/auth.action'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await clearSession()
      toast.success('Signed out successfully!')
      router.push('/landing')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        {user.photoURL ? (
          <Image 
            src={user.photoURL} 
            alt="User profile" 
            width={40} 
            height={40} 
            className="rounded-full object-cover" 
            unoptimized={user.photoURL.startsWith('data:')}
            key={user.photoURL}
          />
        ) : (
          <div className="w-10 h-10 bg-primary-200/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-200" />
          </div>
        )}
        <div className="hidden sm:block text-left">
          <div className="text-sm text-white font-medium">{user.name}</div>
          <div className="text-xs text-light-100">{user.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-light-100 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-800">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-xs text-light-100">{user.email}</div>
          </div>
          
          <div className="py-2">
            <Link 
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-light-100 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </Link>
            
            <Link 
              href="/interviews"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-light-100 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              My Interviews
            </Link>
            
            <Link 
              href="/landing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-light-100 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About PM Interviewer
            </Link>
            
            <button
              onClick={() => {
                setIsOpen(false)
                handleSignOut()
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-light-100 hover:bg-gray-800/50 hover:text-white transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
