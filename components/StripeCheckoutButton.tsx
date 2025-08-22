'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Crown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StripeCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function StripeCheckoutButton({ 
  className = '',
  children 
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout')
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children || (
          <>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </>
        )
      )}
    </Button>
  )
}
