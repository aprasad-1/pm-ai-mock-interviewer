'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { simulateWalletState } from '@/lib/actions/wallet-testing.action'

export default function WalletTestButtons() {
  const handleWalletTest = async (state: 'empty' | 'low' | 'critical' | 'normal') => {
    try {
      const result = await simulateWalletState(state)
      if (result.success) {
        // Refresh the page to show updated wallet balance
        window.location.reload()
      } else {
        console.error('Failed to update wallet:', result.message)
      }
    } catch (error) {
      console.error('Error updating wallet:', error)
    }
  }

  return (
    <Card className="bg-dark-200 border-light-800">
      <CardHeader>
        <CardTitle className="text-light-100">🧪 Wallet State Testing</CardTitle>
        <CardDescription className="text-light-600">
          Test different wallet scenarios (REMOVE IN PRODUCTION)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleWalletTest('empty')}
            variant="destructive" 
            className="w-full"
          >
            Set to 0 Minutes
          </Button>
          
          <Button 
            onClick={() => handleWalletTest('critical')}
            variant="outline" 
            className="w-full border-warning-200 text-warning-200 hover:bg-warning-200/10"
          >
            Set to 1 Minute
          </Button>
          
          <Button 
            onClick={() => handleWalletTest('low')}
            variant="outline" 
            className="w-full border-warning-200 text-warning-200 hover:bg-warning-200/10"
          >
            Set to 5 Minutes
          </Button>
          
          <Button 
            onClick={() => handleWalletTest('normal')}
            variant="outline" 
            className="w-full border-success-200 text-success-200 hover:bg-success-200/10"
          >
            Set to 30 Minutes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
