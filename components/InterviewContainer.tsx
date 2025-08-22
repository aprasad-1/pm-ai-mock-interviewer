'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Agent from './Agent'
import InterviewTimer from './InterviewTimer'
import InterviewWalletCheck from './InterviewWalletCheck'
import { toast } from 'sonner'

interface InterviewContainerProps {
  userName: string
  userID: string
  type: string
  assistantId?: string
  interviewQuestions?: string[]
  questionSetId?: string
  userPhotoURL?: string
  hasEnoughMinutes: boolean
  requiredMinutes: number
  initialWalletMinutes: number
}

export default function InterviewContainer({
  userName,
  userID,
  type,
  assistantId,
  interviewQuestions = [],
  questionSetId,
  userPhotoURL,
  hasEnoughMinutes,
  requiredMinutes,
  initialWalletMinutes
}: InterviewContainerProps) {
  const router = useRouter()
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [hasTimerEnded, setHasTimerEnded] = useState(false)

  const handleInterviewStateChange = useCallback((isActive: boolean) => {
    console.log('📍 Interview state changed:', isActive)
    setIsInterviewActive(isActive)
  }, [])

  const handleTimerEnd = useCallback(() => {
    console.log('⏰ Timer ended - no more minutes!')
    setHasTimerEnded(true)
    toast.error('Interview time expired. Please add more minutes to continue.')
    // Force end the interview
    setIsInterviewActive(false)
    // Redirect after a delay
    setTimeout(() => {
      router.push('/profile')
    }, 3000)
  }, [router])

  // Show wallet check if no minutes
  if (!hasEnoughMinutes || hasTimerEnded) {
    return (
      <InterviewWalletCheck
        hasEnoughMinutes={false}
        requiredMinutes={requiredMinutes}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Interview Timer - Always visible during interview */}
      <div className="sticky top-4 z-10">
        <InterviewTimer
          userId={userID}
          initialMinutes={initialWalletMinutes}
          isInterviewActive={isInterviewActive}
          onTimerEnd={handleTimerEnd}
        />
      </div>

      {/* Interview Agent */}
      <Agent
        userName={userName}
        userID={userID}
        type={type}
        assistantId={assistantId}
        interviewQuestions={interviewQuestions}
        questionSetId={questionSetId}
        userPhotoURL={userPhotoURL}
        onInterviewStateChange={handleInterviewStateChange}
      />
    </div>
  )
}
