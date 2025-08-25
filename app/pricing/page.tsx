import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, Clock } from 'lucide-react'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getSubscriptionInfo } from '@/lib/actions/subscription.action'
import PricingCards from '@/components/PricingCards'

export default async function PricingPage() {
  const user = await getCurrentUser()
  const subscription = user ? await getSubscriptionInfo() : null
  const isActiveSubscriber = subscription?.status === 'active'
  return (
    <div className="min-h-screen bg-dark-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-light-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-light-600 max-w-2xl mx-auto">
            Unlock your interview potential with 100 monthly minutes and advanced AI feedback
          </p>
        </div>

        <PricingCards user={user} isActiveSubscriber={isActiveSubscriber} />

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-light-100 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-dark-200 rounded-lg p-6">
              <h3 className="font-semibold text-light-100 mb-2">
                What happens when I run out of free minutes?
              </h3>
              <p className="text-light-600 text-sm">
                You'll see a prompt to upgrade to Pro for 100 monthly minutes, or you can purchase additional minute packages.
              </p>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-6">
              <h3 className="font-semibold text-light-100 mb-2">
                Can I cancel and resubscribe to get more minutes?
              </h3>
              <p className="text-light-600 text-sm">
                No, our system prevents gaming by limiting upgrade bonuses to once per calendar month. You'll only receive the 100-minute bonus once per month, regardless of subscription changes.
              </p>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-6">
              <h3 className="font-semibold text-light-100 mb-2">
                Can I cancel my Pro subscription anytime?
              </h3>
              <p className="text-light-600 text-sm">
                Yes! You can cancel your Pro subscription at any time. You'll continue to have Pro features until the end of your billing period.
              </p>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-6">
              <h3 className="font-semibold text-light-100 mb-2">
                Do unused minutes roll over?
              </h3>
              <p className="text-light-600 text-sm">
                Free plan minutes don't expire, but additional purchased minutes are valid for 12 months from purchase date.
              </p>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-6">
              <h3 className="font-semibold text-light-100 mb-2">
                Is there a money-back guarantee?
              </h3>
              <p className="text-light-600 text-sm">
                Yes! We offer a 7-day money-back guarantee if you're not satisfied with your Pro subscription.
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
