import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import InterviewCategoryCard from '@/components/InterviewCategoryCard'
import InterviewFeedbackCard from '@/components/InterviewFeedbackCard'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviews, getUserInterviewFeedbacks } from '@/lib/actions/general.action'
import { interviewQuestionSets } from '@/lib/interview-templates'

const HomePage = async () => {
  const user = await getCurrentUser()
  
  // For non-authenticated users, show landing page content
  if (!user) {
    redirect('/landing')
  }
  
  const [, { feedbacks }] = await Promise.all([
    getInterviews(user.uid),
    getUserInterviewFeedbacks(user.uid)
  ])

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Welcome Dashboard Section */}
      <section className="px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, <span className="text-primary-200">{user.name}</span>
            </h1>
            <p className="text-light-100">
              Ready to continue your interview preparation?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <Link href="/interview?type=product-design">
              <Button className="btn-primary min-h-[44px] w-full sm:w-auto">
                Start Interview
              </Button>
            </Link>
            <Link href="/feedback">
              <Button variant="outline" className="text-primary-200 border-primary-200 min-h-[44px] w-full sm:w-auto">
                View Feedback
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] p-4 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-1">Total Interviews</h3>
            <p className="text-2xl font-bold text-primary-200">{feedbacks.length}</p>
          </div>
          <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] p-4 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-1">This Week</h3>
            <p className="text-2xl font-bold text-primary-200">
              {feedbacks.filter(f => {
                const feedbackDate = new Date(f.createdAt)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return feedbackDate > weekAgo
              }).length}
            </p>
          </div>
          <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] p-4 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-1">Average Score</h3>
            <p className="text-2xl font-bold text-primary-200">
              {feedbacks.length > 0 
                ? Math.round(feedbacks.map(f => f.feedback?.totalScore || 0).reduce((acc, score) => acc + score, 0) / feedbacks.length)
                : 0}%
            </p>
          </div>
        </div>
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




    </div>
  )
}

export default HomePage