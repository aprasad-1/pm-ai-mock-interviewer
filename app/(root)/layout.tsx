import React from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/actions/auth.action'
import UserMenu from '@/components/UserMenu'

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: string | null;
}

const Navbar = ({ user }: { user: User | null }) => {
  return (
    <nav className="flex items-center justify-between p-4 sm:px-6 lg:px-8 border-b">
      <Link href="/" className="text-xl sm:text-2xl font-bold text-primary-200 truncate">
        PM Interviewer
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/sign-in">
              <span className="text-primary-200 hover:text-primary-100 transition-colors">
                Sign In
              </span>
            </Link>
            <Link href="/sign-up">
              <span className="btn-primary px-4 py-2 text-sm">
                Get Started
              </span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

const RootLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await getCurrentUser()
  
  return (
    <div className="root-layout">
      <Navbar user={user} />
      {children}
    </div>
  )
}

export default RootLayout