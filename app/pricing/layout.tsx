import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth.action'
import UserMenu from '@/components/UserMenu'

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: string | null;
}

const PricingNavbar = ({ user }: { user: User | null }) => {
  return (
    <nav className="flex items-center justify-between p-4 sm:px-6 lg:px-8 border-b">
      <Link href={user ? "/" : "/landing"} className="text-xl sm:text-2xl font-bold text-primary-200 truncate">
        PM Interviewer
      </Link>
      <div className="hidden md:flex items-center gap-6">
        {user && (
          <>
            <Link href="/interviews" className="text-light-100 hover:text-primary-200 transition-colors">
              Interviews
            </Link>
            <Link href="/feedback" className="text-light-100 hover:text-primary-200 transition-colors">
              Feedback
            </Link>
          </>
        )}
        <Link href="/landing" className="text-light-100 hover:text-primary-200 transition-colors">
          About
        </Link>
        <Link href="/pricing" className="text-light-100 hover:text-primary-200 transition-colors">
          Pricing
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Link href="/sign-in">
              <span className="text-primary-200 hover:text-primary-100 transition-colors">
                Sign In
              </span>
            </Link>
            <Link href="/sign-up">
              <Button className="btn-primary px-4 py-2 text-sm">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

const PricingLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await getCurrentUser()
  
  return (
    <div className="root-layout">
      <PricingNavbar user={user} />
      {children}
    </div>
  )
}

export default PricingLayout
