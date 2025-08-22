'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertTriangle, Clock, Crown, Plus, ArrowRight } from 'lucide-react'

interface WalletGuardProps {
  walletMinutes: number
  requiredMinutes?: number
  children: React.ReactNode
}

export default function WalletGuard({ 
  walletMinutes, 
  requiredMinutes = 1, 
  children 
}: WalletGuardProps) {
  const router = useRouter()

  if (walletMinutes >= requiredMinutes) {
    return <>{children}</>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-dark-200 border-destructive-200/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive-200/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive-200" />
          </div>
          <CardTitle className="text-2xl text-light-100">
            Insufficient Interview Minutes
          </CardTitle>
          <CardDescription className="text-light-600">
            You need at least {requiredMinutes} minute{requiredMinutes !== 1 ? 's' : ''} to start an interview
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="bg-dark-300 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-light-600" />
              <span className="text-light-100 font-medium">Current Balance</span>
            </div>
            <div className="text-4xl font-mono font-bold text-destructive-200">
              {walletMinutes}
            </div>
            <p className="text-xs text-light-600 mt-1">
              minutes remaining
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Pro Upgrade Option */}
            <div className="bg-gradient-to-r from-primary-200/10 to-success-200/10 rounded-lg p-4 border border-primary-200/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary-200" />
                  <span className="font-semibold text-light-100">Upgrade to Pro</span>
                </div>
                <span className="text-xs bg-success-200/20 text-success-200 px-2 py-1 rounded-full">
                  RECOMMENDED
                </span>
              </div>
              
              <p className="text-sm text-light-100 mb-3">
                Get unlimited interview minutes plus advanced features
              </p>
              
              <ul className="space-y-1 text-sm text-light-100 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                  <span>Unlimited interview time</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                  <span>Advanced AI feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                  <span>Interview analytics</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => router.push('/pricing')}
                className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Add Minutes Option */}
            <div className="bg-dark-300/50 rounded-lg p-4 border border-light-800/20">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-5 h-5 text-light-100" />
                <span className="font-semibold text-light-100">Add More Minutes</span>
              </div>
              
              <p className="text-sm text-light-600 mb-4">
                Purchase additional interview minutes for your current plan
              </p>
              
              <Button 
                onClick={() => router.push('/profile')}
                variant="outline"
                className="w-full border-light-800 text-light-100 hover:bg-light-800/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Minutes
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-light-600 hover:text-light-100"
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
