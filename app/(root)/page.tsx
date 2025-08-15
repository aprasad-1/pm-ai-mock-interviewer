import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviews } from '@/lib/actions/general.action'

const HomePage = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-200 mx-auto mb-4"></div>
        <p className="text-light-100">Loading...</p>
      </div>
    </div> // This should not happen due to layout protection
  }
  
  const { userInterviews, otherInterviews } = await getInterviews(user.uid)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-white mb-6">
          Get interview-ready with{' '}
          <span className="text-primary-200">AI-powered</span>{' '}
          practice and feedback
        </h1>
        <p className="text-xl text-light-100 mb-8 max-w-3xl mx-auto">
          Practice with our AI interviewer and get instant feedback to improve your performance.
          Perfect your answers for technical and behavioral questions.
        </p>
        <Link href="/interview?type=product-design">
          <Button className="btn-primary text-lg px-8 py-4">
            Start an Interview
          </Button>
        </Link>
      </section>

      {/* Your Interviews Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-white">Your Interviews</h2>
          <Button className="btn-secondary">
            Create New Interview
          </Button>
        </div>
        
        {userInterviews.length > 0 ? (
          <div className="interviews-section">
            {userInterviews.map((interview) => (
              <InterviewCard 
                key={interview.id} 
                interview={interview} 
                isUserInterview={true}
              />
            ))}
          </div>
        ) : (
          <div className="card-border">
            <div className="card p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                No interviews yet
              </h3>
              <p className="text-light-100 mb-6">
                Create your first interview to start practicing with our AI interviewer.
              </p>
              <Button className="btn-primary">
                Create Your First Interview
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Take an Interview Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-white">Take an Interview</h2>
          <Button variant="outline" className="text-primary-200 border-primary-200">
            View All
          </Button>
        </div>
        
        {otherInterviews.length > 0 ? (
          <div className="interviews-section">
            {otherInterviews.map((interview) => (
              <InterviewCard 
                key={interview.id} 
                interview={interview} 
                isUserInterview={false}
              />
            ))}
          </div>
        ) : (
          <div className="card-border">
            <div className="card p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                No interviews available
              </h3>
              <p className="text-light-100">
                Check back later for new interview opportunities from the community.
              </p>
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