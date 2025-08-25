import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import InterviewCategoryCard from '@/components/InterviewCategoryCard'
import { interviewQuestionSets } from '@/lib/interview-templates'
import { getCurrentUser } from '@/lib/actions/auth.action'

const LandingPage = async () => {
  const user = await getCurrentUser()
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <section className="text-center py-8 sm:py-16 px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Get interview-ready with{' '}
          <span className="text-primary-200">AI-powered</span>{' '}
          practice and feedback
        </h1>
        <p className="text-lg sm:text-xl text-light-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
          Practice with our AI interviewer and get instant feedback to improve your performance.
          Perfect your answers for technical and behavioral questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link href="/">
                <Button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/interview?type=product-design">
                <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px]">
                  Start Interview
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-up">
                <Button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px]">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            Why Choose PM Interviewer?
          </h2>
          <p className="text-light-100 max-w-2xl mx-auto">
            Our AI-powered platform provides comprehensive interview preparation tailored for product management roles.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-200/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Feedback</h3>
            <p className="text-light-100">
              Get instant, detailed feedback on your answers with actionable insights to improve your performance.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-200/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Comprehensive Question Bank</h3>
            <p className="text-light-100">
              Practice with hundreds of real PM interview questions across all major categories and difficulty levels.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-200/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Track Your Progress</h3>
            <p className="text-light-100">
              Monitor your improvement over time with detailed analytics and performance tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Interview Categories Preview */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Interview Categories</h2>
          {user ? (
            <Link href="/">
              <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px] w-full sm:w-auto">
                View All in Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px] w-full sm:w-auto">
                Get Started to View All
              </Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {interviewQuestionSets.slice(0, 3).map((questionSet) => (
            <InterviewCategoryCard 
              key={questionSet.id} 
              questionSet={questionSet}
            />
          ))}
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            Top questions from companies like:
          </h2>
        </div>
        
        {/* Company Logos Grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Meta */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/meta.png" 
              alt="Meta" 
              className="h-8 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
          
          {/* Google */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/google.png" 
              alt="Google" 
              className="h-8 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
          
          {/* Microsoft */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/microsoft.png" 
              alt="Microsoft" 
              className="h-8 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
          
          {/* Amazon */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/amazon.png" 
              alt="Amazon" 
              className="h-8 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
          
          {/* Airbnb */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/airbnb.png" 
              alt="Airbnb" 
              className="h-8 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
          
          {/* TikTok */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/tiktok.png" 
              alt="TikTok" 
              className="h-8 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
          
          {/* Stripe */}
          <div className="flex items-center justify-center h-12 w-20 md:w-24">
            <img 
              src="/logos/stripe.png" 
              alt="Stripe" 
              className="h-10 w-auto object-contain filter brightness-0 invert opacity-40"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="card-cta">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-white mb-2">
            Ready to ace your next interview?
          </h3>
          <p className="text-light-100">
            Join thousands of professionals who have improved their interview skills with PM Interviewer.
          </p>
        </div>
        <Link href="/sign-up">
          <Button className="btn-primary">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  )
}

export default LandingPage
