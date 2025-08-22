'use client'

import React, { useState, useEffect } from 'react'
import { getUserProfile } from '@/lib/actions/user.action'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface WalletCheckProps {
  onProceed: () => void
  onCancel: () => void
  requiredMinutes?: number
}

export default function WalletCheck({ onProceed, onCancel, requiredMinutes = 30 }: WalletCheckProps) {
  const [walletMinutes, setWalletMinutes] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const profile = await getUserProfile()
        setWalletMinutes(profile.walletMinutes)
        setError(null)
      } catch (err) {
        setError('Failed to check wallet balance')
      } finally {
        setIsLoading(false)
      }
    }

    checkWallet()
  }, [])

  const hasEnoughMinutes = walletMinutes !== null && walletMinutes >= requiredMinutes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-200"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-200 rounded-lg p-6 border border-destructive-200/20">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive-200" />
          <h3 className="text-lg font-semibold text-light-100">Error</h3>
        </div>
        <p className="text-light-600 mb-4">{error}</p>
        <Button onClick={onCancel} variant="outline" className="w-full">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-dark-200 rounded-lg p-6 border border-light-800">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-200/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-primary-200" />
        </div>
        <h3 className="text-xl font-semibold text-light-100 mb-2">
          Interview Minutes Required
        </h3>
        <p className="text-light-600">
          This interview requires {requiredMinutes} minutes from your wallet
        </p>
      </div>

      <div className="bg-dark-300 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-light-100">Your Wallet Balance:</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-success-200" />
            <span className={`text-lg font-semibold ${hasEnoughMinutes ? 'text-success-200' : 'text-destructive-200'}`}>
              {walletMinutes} minutes
            </span>
          </div>
        </div>
        
        {hasEnoughMinutes ? (
          <div className="flex items-center gap-2 mt-3 text-success-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Sufficient balance</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 text-destructive-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Insufficient balance</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="flex-1 border-light-800 text-light-100 hover:bg-light-800/20"
        >
          Cancel
        </Button>
        
        {hasEnoughMinutes ? (
          <Button 
            onClick={onProceed} 
            className="flex-1 bg-primary-200 text-dark-100 hover:bg-primary-100"
          >
            Start Interview
          </Button>
        ) : (
          <Button 
            disabled 
            className="flex-1 bg-light-800 text-light-600 cursor-not-allowed"
          >
            Insufficient Minutes
          </Button>
        )}
      </div>

      {!hasEnoughMinutes && (
        <div className="mt-4 p-3 bg-primary-200/10 border border-primary-200/20 rounded-lg">
          <p className="text-sm text-primary-200 text-center">
            You need {requiredMinutes - (walletMinutes || 0)} more minutes to start this interview.
            <br />
            <a href="/profile" className="underline hover:text-primary-100">
              Visit your profile to add more minutes
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
