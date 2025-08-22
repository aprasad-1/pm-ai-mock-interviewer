'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Agent from './Agent'
import CleanInterviewTimer from './CleanInterviewTimer'
import WalletGuard from './WalletGuard'

interface SimpleInterviewContainerProps {
  userName: string
  userID: string
  type: string
  assistantId?: string
  interviewQuestions?: string[]
  questionSetId?: string
  userPhotoURL?: string
  hasEnoughMinutes: boolean
  walletMinutes: number
  subscriptionStatus?: string
}

export default function SimpleInterviewContainer({
  userName,
  userID,
  type,
  assistantId,
  interviewQuestions = [],
  questionSetId,
  userPhotoURL,
  hasEnoughMinutes,
  walletMinutes,
  subscriptionStatus = 'free'
}: SimpleInterviewContainerProps) {
  const router = useRouter()
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [forceEndInterview, setForceEndInterview] = useState(false)

  const handleInterviewStateChange = useCallback((isActive: boolean) => {
    console.log('📍 SimpleInterviewContainer: Interview state changed to:', isActive ? 'STARTED' : 'ENDED')
    setIsInterviewActive(isActive)
  }, []) // Remove isInterviewActive from dependencies to prevent loops

  const handleWalletDepleted = useCallback(() => {
    console.log('💸 Wallet depleted - ending interview')
    setIsInterviewActive(false)
    setForceEndInterview(true)
  }, [])

  const isProUser = subscriptionStatus === 'active'
  // Pro users get their actual wallet minutes (100/month), not unlimited
  const effectiveWalletMinutes = walletMinutes

  return (
    <WalletGuard walletMinutes={effectiveWalletMinutes} requiredMinutes={1}>
      <div className="space-y-4">
        {/* Clean Interview Timer */}
        <div className="sticky top-4 z-10 flex justify-center">
          <CleanInterviewTimer
            isActive={isInterviewActive}
            userId={userID}
            initialWalletMinutes={walletMinutes}
            onWalletDepleted={handleWalletDepleted}
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
          forceEnd={forceEndInterview}
        />
      </div>
    </WalletGuard>
  )
}
