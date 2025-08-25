import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import InterviewFeedbackCard from '@/components/InterviewFeedbackCard'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserInterviewFeedbacks } from '@/lib/actions/general.action'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

const InterviewsPage = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const result = await getUserInterviewFeedbacks(user.uid)
  const feedbacks = result.success ? result.feedbacks : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Interview History & Analysis</h1>
          <p className="text-light-100">View all your completed interviews with detailed feedback and track your progress</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-border">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-primary-200 mb-2">{feedbacks.length}</div>
            <div className="text-light-100">Total Interviews</div>
          </div>
        </div>
        <div className="card-border">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {feedbacks.length > 0 ? Math.round(feedbacks.reduce((sum, f) => sum + f.feedback.totalScore, 0) / feedbacks.length) : 0}
            </div>
            <div className="text-light-100">Average Score</div>
          </div>
        </div>
        <div className="card-border">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {feedbacks.filter(f => f.feedback.totalScore >= 8).length}
            </div>
            <div className="text-light-100">High Scores (8+)</div>
          </div>
        </div>
      </div>

      {/* All Interview Cards */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-white">Interview History ({feedbacks.length})</h2>
          <div className="flex gap-3">
            <Link href="/feedback">
              <Button variant="outline" className="text-primary-200 border-primary-200">
                View Feedback
              </Button>
            </Link>
            <Link href="/interview?type=product-design">
              <Button className="btn-primary">
                New Interview
              </Button>
            </Link>
          </div>
        </div>
        
        {feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {feedbacks.map((feedbackData) => (
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
                No interview analyses yet
              </h3>
              <p className="text-light-100 mb-6">
                Complete an interview to receive detailed AI-powered feedback and analysis.
              </p>
              <Link href="/interview?type=product-design">
                <Button className="btn-primary">
                  Start Your First Interview
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default InterviewsPage
