'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertTriangle, Clock, Crown, ArrowRight } from 'lucide-react'

interface WalletDepletedModalProps {
  isOpen: boolean
  onClose: () => void
  timeUsed?: string
}

export default function WalletDepletedModal({ 
  isOpen, 
  onClose, 
  timeUsed = "0:00" 
}: WalletDepletedModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleAddMinutes = () => {
    router.push('/profile')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-dark-200 border-destructive-200/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive-200/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive-200" />
          </div>
          <CardTitle className="text-2xl text-light-100">
            Interview Minutes Depleted
          </CardTitle>
          <CardDescription className="text-light-600">
            You've used all your available interview minutes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Time Used Display */}
          <div className="bg-dark-300 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary-200" />
              <span className="text-light-100 font-medium">Time Used This Session</span>
            </div>
            <div className="text-3xl font-mono font-bold text-primary-200">
              {timeUsed}
            </div>
            <p className="text-xs text-light-600 mt-2">
              This time has been deducted from your wallet
            </p>
          </div>

          {/* Upgrade Pitch */}
          <div className="bg-gradient-to-r from-primary-200/10 to-success-200/10 rounded-lg p-4 border border-primary-200/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-primary-200" />
              <span className="font-semibold text-light-100">Upgrade to Pro</span>
            </div>
            <ul className="space-y-2 text-sm text-light-100">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                <span>Unlimited interview minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                <span>Advanced AI feedback</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-success-200 rounded-full"></div>
                <span>Interview history & analytics</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100 font-semibold"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleAddMinutes}
              variant="outline"
              className="flex-1 border-light-800 text-light-100 hover:bg-light-800/20"
            >
              Add Minutes
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-light-800 text-light-100 hover:bg-light-800/20"
            >
              Close
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
