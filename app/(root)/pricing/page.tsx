import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Clock } from 'lucide-react'
import StripeCheckoutButton from '@/components/StripeCheckoutButton'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getSubscriptionInfo } from '@/lib/actions/subscription.action'

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
            Unlock your interview potential with unlimited practice time and advanced AI feedback
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="bg-dark-200 border-light-800">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-light-100" />
                <CardTitle className="text-2xl text-light-100">Free Plan</CardTitle>
              </div>
              <CardDescription className="text-light-600">
                Perfect for getting started with AI interviews
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-light-100">$0</span>
                <span className="text-light-600">/month</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">30 free minutes on signup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Basic AI feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Standard interview questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Interview transcripts</span>
                </li>
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-light-800 text-light-100"
                disabled
              >
                {user ? 'Current Plan' : 'Sign Up for Free'}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gradient-to-br from-primary-200/10 to-success-200/10 border-primary-200/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-200 text-dark-100 px-4 py-1 rounded-full text-sm font-semibold">
                RECOMMENDED
              </span>
            </div>
            
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-primary-200" />
                <CardTitle className="text-2xl text-light-100">Pro Plan</CardTitle>
              </div>
              <CardDescription className="text-light-600">
                Unlimited practice with advanced AI coaching
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-light-100">$19</span>
                <span className="text-light-600">/month</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">
                    <strong>Unlimited interview minutes</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Advanced AI feedback & scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Custom interview scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Interview analytics & progress tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-200" />
                  <span className="text-light-100">Interview history & export</span>
                </li>
              </ul>
            </CardContent>
            
            <CardFooter>
              {isActiveSubscriber ? (
                <Button 
                  className="w-full bg-green-600 text-white"
                  disabled
                >
                  <Check className="w-4 h-4 mr-2" />
                  Current Plan
                </Button>
              ) : user ? (
                <StripeCheckoutButton className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </StripeCheckoutButton>
              ) : (
                <Button 
                  className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100"
                  onClick={() => window.location.href = '/sign-in'}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Sign In to Upgrade
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

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
                You'll see a prompt to upgrade to Pro for unlimited minutes, or you can purchase additional minute packages.
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
