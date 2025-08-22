import React from 'react'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/actions/user.action'
import { getSubscriptionInfo } from '@/lib/actions/subscription.action'
import { signOut } from '@/lib/actions/auth.action'
import ProfileForm from '@/components/ProfileForm'
import SubscriptionCard from '@/components/SubscriptionCard'
import { Button } from '@/components/ui/button'
import { Clock, CreditCard, User, LogOut, Crown } from 'lucide-react'

export default async function ProfilePage() {
  let userProfile
  let subscriptionInfo
  
  try {
    userProfile = await getUserProfile()
    subscriptionInfo = await getSubscriptionInfo()
  } catch (error) {
    // If unauthorized, redirect to sign-in
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-dark-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-light-100 mb-2">
            Account Settings
          </h1>
          <p className="text-light-600 text-lg">
            Manage your profile, wallet, and subscription
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Section */}
          <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-200/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-200" />
              </div>
              <h2 className="text-xl font-semibold text-light-100">Profile</h2>
            </div>
            <ProfileForm 
              currentName={userProfile.name} 
              currentEmail={userProfile.email} 
            />
          </div>

          {/* Wallet Section */}
          <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-200/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-success-200" />
              </div>
              <h2 className="text-xl font-semibold text-light-100">Wallet</h2>
            </div>
            
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-success-200 mb-2">
                {userProfile.walletMinutes}
              </div>
              <p className="text-light-100 text-lg">
                minutes remaining
              </p>
              <p className="text-light-600 text-sm mt-2">
                Use these minutes for interview sessions
              </p>
            </div>
          </div>

          {/* Subscription Section */}
          <SubscriptionCard subscriptionInfo={subscriptionInfo} />
          
          {/* Legacy Billing Section - Keep temporarily for testing */}
          <div className="bg-dark-200 rounded-lg p-6 border border-light-800 opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-200/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-200" />
              </div>
              <h2 className="text-xl font-semibold text-light-100">Legacy Billing (Testing)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-primary-200" />
                  <span className="text-light-100 font-medium">
                    {userProfile.subscriptionStatus === 'free' ? 'Free Plan' : 'Pro Plan'}
                  </span>
                </div>
                <p className="text-light-600 text-sm">
                  {userProfile.subscriptionStatus === 'free' 
                    ? 'You are currently on the Free Plan' 
                    : 'You have an active Pro subscription'
                  }
                </p>
              </div>
              
              <p className="text-xs text-light-600 text-center">
                This section will be removed - use the Subscription card above
              </p>
              
              {/* Temporary migration button - remove after migration */}
              <form action={async () => {
                'use server'
                const { runMigration } = await import('@/lib/migrations/run-migration')
                const result = await runMigration()
                console.log('Migration result:', result)
              }}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 border-warning-200 text-warning-200 hover:bg-warning-200 hover:text-dark-100"
                >
                  Run Migration (Check Console)
                </Button>
              </form>
              
              {/* Temporary add minutes button - remove after testing */}
              <form action={async () => {
                'use server'
                const { adminAddWalletMinutes } = await import('@/lib/actions/user.action')
                const { getCurrentUser } = await import('@/lib/actions/auth.action')
                const { revalidatePath } = await import('next/cache')
                
                const user = await getCurrentUser()
                if (user) {
                  const success = await adminAddWalletMinutes(user.uid, 30)
                  if (success) {
                    console.log('✅ Added 30 minutes to wallet')
                    revalidatePath('/profile')
                  } else {
                    console.log('❌ Failed to add minutes')
                  }
                }
              }}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 border-success-200 text-success-200 hover:bg-success-200 hover:text-dark-100"
                >
                  Add 30 Test Minutes
                </Button>
              </form>
              
              {/* Test wallet balance button */}
              <form action={async () => {
                'use server'
                const user = await import('@/lib/actions/auth.action').then(m => m.getCurrentUser())
                if (user) {
                  const { getUserProfile } = await import('@/lib/actions/user.action')
                  try {
                    const profile = await getUserProfile()
                    console.log('💰 Current wallet balance:', profile.walletMinutes, 'minutes')
                  } catch (error) {
                    console.log('❌ Failed to get wallet balance:', error)
                  }
                }
              }}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 border-primary-200 text-primary-200 hover:bg-primary-200 hover:text-dark-100"
                >
                  Check Wallet Balance
                </Button>
              </form>
              

            </div>
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-light-100 mb-1">
                Sign Out
              </h3>
              <p className="text-light-600 text-sm">
                Sign out of your account on this device
              </p>
            </div>
            
            <form action={signOut}>
              <Button 
                type="submit" 
                variant="outline" 
                className="border-destructive-200 text-destructive-200 hover:bg-destructive-200 hover:text-dark-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
