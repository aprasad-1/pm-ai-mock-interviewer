import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getTranscript } from '@/lib/actions/general.action'
import FeedbackDisplay from '@/components/FeedbackDisplay'

interface FeedbackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const FeedbackPage = async ({ searchParams }: FeedbackPageProps) => {
  // Authentication check
  let user
  try {
    user = await getCurrentUser()
  } catch (error) {
    console.error('Authentication error:', error)
    redirect('/sign-in?error=auth_failed')
  }

  if (!user) {
    redirect('/sign-in?error=unauthorized&message=Please sign in to view feedback')
  }

  // Get transcript ID from URL
  const resolvedSearchParams = await searchParams;
  const transcriptId = resolvedSearchParams.transcriptId as string
  
  if (!transcriptId) {
    redirect('/?error=missing_transcript')
  }

  // Fetch transcript data
  let transcriptData
  try {
    const result = await getTranscript(transcriptId)
    if (!result.success) {
      throw new Error('Transcript not found')
    }
    transcriptData = result.transcript
  } catch (error) {
    console.error('Error fetching transcript:', error)
    redirect('/?error=transcript_not_found')
  }

  // Verify user owns this transcript
  if (transcriptData.userId !== user.uid) {
    redirect('/?error=unauthorized_transcript')
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Interview Feedback
          </h1>
          <p className="text-sm sm:text-base text-light-100">
            Review your interview transcript and get AI-powered analysis
          </p>
        </div>
        
        <FeedbackDisplay 
          transcript={transcriptData}
          userId={user.uid}
        />
      </div>
    </div>
  )
}

export default FeedbackPage
