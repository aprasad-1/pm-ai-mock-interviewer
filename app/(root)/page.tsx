import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import InterviewCategoryCard from '@/components/InterviewCategoryCard'
import InterviewFeedbackCard from '@/components/InterviewFeedbackCard'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviews, getUserInterviewFeedbacks } from '@/lib/actions/general.action'
import { interviewQuestionSets } from '@/lib/interview-templates'

const HomePage = async () => {
  const user = await getCurrentUser()
  
  // For non-authenticated users, show limited content
  if (!user) {
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
          </div>
        </section>

        {/* Take an Interview Section */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Take an Interview</h2>
            <Link href="/sign-up">
              <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px] w-full sm:w-auto">
                Get Started to View All
              </Button>
            </Link>
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
  
  const [, { feedbacks }] = await Promise.all([
    getInterviews(user.uid),
    getUserInterviewFeedbacks(user.uid)
  ])

  // Limit to 3 most recent feedbacks for homepage display
  const recentFeedbacks = feedbacks.slice(0, 3)

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
        <Link href="/interview?type=product-design">
          <Button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]">
            Start an Interview
          </Button>
        </Link>
      </section>

      {/* Take an Interview Section */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Take an Interview</h2>
          <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px] w-full sm:w-auto">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {interviewQuestionSets.map((questionSet) => (
            <InterviewCategoryCard 
              key={questionSet.id} 
              questionSet={questionSet}
            />
          ))}
        </div>
      </section>

      {/* Interview Analysis & Feedback Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-white">Interview Analysis & Feedback</h2>
          {feedbacks.length > 3 ? (
            <Link href="/interviews">
              <Button variant="outline" className="text-primary-200 border-primary-200">
                Show More ({feedbacks.length})
              </Button>
            </Link>
          ) : (
            <Link href="/interview">
              <Button variant="outline" className="text-primary-200 border-primary-200">
                New Analysis
              </Button>
            </Link>
          )}
        </div>
        
        {recentFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFeedbacks.map((feedbackData) => (
              <div key={feedbackData.id} className="h-full">
                <InterviewFeedbackCard 
                  feedbackData={feedbackData}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-border">
            <div className="card p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                No interview analysis yet
              </h3>
              <p className="text-light-100 mb-6">
                Complete an interview to receive detailed AI-powered feedback and analysis.
              </p>
              <Link href="/interview">
                <Button className="btn-primary">
                  Start Your First Interview
                </Button>
              </Link>
            </div>
          </div>
        )}
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
        <Button className="btn-primary">
          Get Started Now
        </Button>
      </section>
    </div>
  )
}

export default HomePage