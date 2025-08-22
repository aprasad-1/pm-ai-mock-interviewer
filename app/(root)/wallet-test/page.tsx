import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/user.action'
import WalletTestButtons from '@/components/WalletTestButtons'
import QuickActionButtons from '@/components/QuickActionButtons'

export default async function WalletTestPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  let profile
  try {
    profile = await getUserProfile()
  } catch {
    profile = null
  }

  return (
    <div className="min-h-screen bg-dark-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-light-100">Wallet System Test</h1>
        
        {/* User Info */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <h2 className="text-xl font-semibold text-light-100 mb-4">User Information</h2>
          <div className="space-y-2 text-light-100">
            <p><span className="text-light-600">Name:</span> {user.name}</p>
            <p><span className="text-light-600">Email:</span> {user.email}</p>
            <p><span className="text-light-600">User ID:</span> {user.uid}</p>
            <p><span className="text-light-600">Wallet Minutes:</span> {profile?.walletMinutes || 0}</p>
            <p><span className="text-light-600">Subscription:</span> {profile?.subscriptionStatus || 'free'}</p>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <h2 className="text-xl font-semibold text-light-100 mb-4">How to Test</h2>
          <ol className="space-y-3 text-light-100 list-decimal list-inside">
            <li>Check your current wallet balance above</li>
            <li>Go to the interview page and start an interview</li>
            <li>Watch the timer count up (shows elapsed time only)</li>
            <li>Let it run for at least 1 minute</li>
            <li>End the interview or navigate away</li>
            <li>Come back here and refresh to see updated balance</li>
            <li>Time is deducted in 1-minute increments (rounded up)</li>
          </ol>
        </div>

        {/* Expected Behavior */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <h2 className="text-xl font-semibold text-light-100 mb-4">Expected Behavior</h2>
          <ul className="space-y-2 text-light-100 list-disc list-inside">
            <li>New users get 30 free minutes on signup</li>
            <li>Timer shows MM:SS format during interview</li>
            <li>Timer syncs every 30 seconds to database</li>
            <li>If you close/navigate away, time is still deducted</li>
            <li>10 seconds of interview = 1 minute deducted</li>
            <li>65 seconds of interview = 2 minutes deducted</li>
            <li>Cannot start interview with 0 minutes</li>
          </ul>
        </div>

        {/* Wallet State Testing */}
        <WalletTestButtons />

        {/* Actions */}
        <QuickActionButtons />

        {/* Console Messages */}
        <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
          <h2 className="text-xl font-semibold text-light-100 mb-4">Console Messages to Look For</h2>
          <div className="bg-dark-300 rounded p-4 font-mono text-sm text-success-200 space-y-1">
            <p>⏱️ Starting interview timer for user: [userId]</p>
            <p>✅ Interview timer started</p>
            <p>⏱️ Timer synced with database</p>
            <p>🔄 Syncing X seconds (Y minutes) for user [userId]</p>
            <p>✅ Deducted Y minutes. New balance: Z</p>
            <p>⏹️ Interview timer stopped. Total time: X seconds</p>
          </div>
        </div>
      </div>
    </div>
  )
}
