'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Clock } from 'lucide-react'
import StripeCheckoutButton from '@/components/StripeCheckoutButton'

interface User {
  uid: string
  email: string
  name: string
  photoURL?: string
}

interface PricingCardsProps {
  user: User | null
  isActiveSubscriber: boolean
}

const PricingCards = ({ user, isActiveSubscriber }: PricingCardsProps) => {
  return (
    <>
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
              100 minutes monthly with advanced AI coaching
            </CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold text-light-100">$7</span>
              <span className="text-light-600">/month</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success-200" />
                <span className="text-light-100">
                  <strong>100 minutes added monthly</strong>
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
              <Link href="/sign-up">
                <Button className="w-full bg-primary-200 text-dark-100 hover:bg-primary-100">
                  <Crown className="w-4 h-4 mr-2" />
                  Sign Up to Upgrade
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Back to Landing/Dashboard */}
      <div className="mt-12 text-center">
        <Link href={user ? '/' : '/landing'}>
          <Button 
            variant="outline" 
            className="text-primary-200 border-primary-200"
          >
            {user ? 'Back to Dashboard' : 'Back to Home'}
          </Button>
        </Link>
      </div>
    </>
  )
}

export default PricingCards
