import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile, addWalletMinutes, consumeWalletTime } from '@/lib/actions/user.action'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export default async function TestWalletPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  let userProfile
  try {
    userProfile = await getUserProfile()
  } catch (error) {
    userProfile = { walletMinutes: 0 }
  }

  return (
    <div className="min-h-screen bg-dark-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-light-100">Wallet Test Page</h1>
        
        {/* Current Balance */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <h2 className="text-xl font-semibold text-light-100 mb-4">Current Balance</h2>
          <div className="text-4xl font-bold text-success-200">
            {userProfile.walletMinutes} minutes
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800 space-y-4">
          <h2 className="text-xl font-semibold text-light-100 mb-4">Test Actions</h2>
          
          {/* Add 30 minutes */}
          <form action={async () => {
            'use server'
            const user = await getCurrentUser()
            if (user) {
              const success = await addWalletMinutes(user.uid, 30)
              console.log('Add 30 minutes:', success ? 'Success' : 'Failed')
              revalidatePath('/test-wallet')
            }
          }}>
            <Button type="submit" className="w-full">
              Add 30 Minutes
            </Button>
          </form>

          {/* Add 60 minutes */}
          <form action={async () => {
            'use server'
            const user = await getCurrentUser()
            if (user) {
              const success = await addWalletMinutes(user.uid, 60)
              console.log('Add 60 minutes:', success ? 'Success' : 'Failed')
              revalidatePath('/test-wallet')
            }
          }}>
            <Button type="submit" className="w-full">
              Add 60 Minutes
            </Button>
          </form>

          {/* Consume 5 minutes */}
          <form action={async () => {
            'use server'
            const user = await getCurrentUser()
            if (user) {
              const success = await consumeWalletTime(user.uid, 300) // 5 minutes = 300 seconds
              console.log('Consume 5 minutes:', success ? 'Success' : 'Failed')
              revalidatePath('/test-wallet')
            }
          }}>
            <Button type="submit" variant="outline" className="w-full">
              Consume 5 Minutes
            </Button>
          </form>

          {/* Consume 10 minutes */}
          <form action={async () => {
            'use server'
            const user = await getCurrentUser()
            if (user) {
              const success = await consumeWalletTime(user.uid, 600) // 10 minutes = 600 seconds
              console.log('Consume 10 minutes:', success ? 'Success' : 'Failed')
              revalidatePath('/test-wallet')
            }
          }}>
            <Button type="submit" variant="outline" className="w-full">
              Consume 10 Minutes
            </Button>
          </form>
        </div>

        {/* User Info */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <h2 className="text-xl font-semibold text-light-100 mb-4">User Info</h2>
          <div className="space-y-2 text-light-100">
            <p>User ID: {user.uid}</p>
            <p>Email: {user.email}</p>
            <p>Name: {user.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
