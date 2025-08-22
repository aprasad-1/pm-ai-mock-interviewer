'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Crown, CreditCard, Calendar, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { createCustomerPortalSession } from '@/lib/actions/subscription.action'
import { toast } from 'sonner'
import StripeCheckoutButton from './StripeCheckoutButton'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

interface SubscriptionCardProps {
  subscriptionInfo: {
    status: string
    planName: string
    price?: string
    currentPeriodEnd?: string
    cancelAtPeriodEnd?: boolean
    features: string[]
  }
}

export default function SubscriptionCard({ subscriptionInfo }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true)
      const result = await createCustomerPortalSession()
      
      if ('url' in result) {
        window.location.href = result.url
      } else {
        throw new Error(result.error || 'Failed to open billing portal')
      }
    } catch (error: any) {
      console.error('Portal error:', error)
      toast.error(error.message || 'Failed to open billing portal')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isProUser = subscriptionInfo.status === 'active'
  const isCanceled = subscriptionInfo.cancelAtPeriodEnd

  return (
    <Card className="bg-dark-200 border-light-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-light-100">Subscription</CardTitle>
            <CardDescription className="text-light-600">
              Manage your subscription and billing
            </CardDescription>
          </div>
          <div className={`p-2 rounded-full ${isProUser ? 'bg-primary-200/20' : 'bg-light-800/20'}`}>
            <Crown className={`w-5 h-5 ${isProUser ? 'text-primary-200' : 'text-light-600'}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="p-4 bg-dark-300 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-light-600">Current Plan</span>
            {isProUser && (
              <span className="text-xs bg-primary-200/20 text-primary-200 px-2 py-1 rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-light-100">
            {subscriptionInfo.planName}
          </p>
          {subscriptionInfo.price && (
            <p className="text-sm text-light-600 mt-1">{subscriptionInfo.price}</p>
          )}
        </div>

        {/* Billing Details */}
        {isProUser && subscriptionInfo.currentPeriodEnd && (
          <div className="p-4 bg-dark-300 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-light-600" />
              <span className="text-sm text-light-600">
                {isCanceled ? 'Access ends on' : 'Next billing date'}
              </span>
            </div>
            <p className="text-light-100">
              {formatDate(subscriptionInfo.currentPeriodEnd)}
            </p>
            {isCanceled && (
              <div className="mt-2 p-2 bg-warning-200/10 rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning-200 mt-0.5" />
                <p className="text-xs text-warning-200">
                  Your subscription will end on this date. You can resume anytime before then.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isProUser ? (
            <>
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="outline"
                className="w-full border-light-800 text-light-100 hover:bg-light-800/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Subscription
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </>
                )}
              </Button>
              {isCanceled && (
                <Button
                  onClick={handleManageSubscription}
                  className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100"
                >
                  Resume Subscription
                </Button>
              )}
            </>
          ) : (
            <StripeCheckoutButton className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </StripeCheckoutButton>
          )}
        </div>

        {/* Features */}
        <div className="pt-4 border-t border-light-800/50">
          <p className="text-sm font-medium text-light-100 mb-3">
            {isProUser ? 'Your Pro features:' : 'Upgrade to get:'}
          </p>
          <ul className="space-y-2">
            {(isProUser ? subscriptionInfo.features : STRIPE_CONFIG.features.pro.features.slice(0, 4)).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-light-600">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isProUser ? 'bg-success-200' : 'bg-light-800'}`} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}


