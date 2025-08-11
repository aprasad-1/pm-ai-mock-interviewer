import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import UserMenu from '@/components/UserMenu'

const Navbar = ({ user }: { user: any }) => {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-2xl font-bold text-primary-200">
        PM Interviewer
      </Link>
      <div className="flex items-center gap-4">
        <UserMenu user={user} />
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
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="root-layout">
      <Navbar user={user} />
      {children}
    </div>
  )
}

export default RootLayout