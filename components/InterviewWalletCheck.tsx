'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import WalletCheck from './WalletCheck'

interface InterviewWalletCheckProps {
  hasEnoughMinutes: boolean
  requiredMinutes: number
}

export default function InterviewWalletCheck({ hasEnoughMinutes, requiredMinutes }: InterviewWalletCheckProps) {
  const router = useRouter()

  const handleProceed = () => {
    // Reload the page to re-check wallet balance
    window.location.reload()
  }

  const handleCancel = () => {
    // Go back to previous page
    router.back()
  }

  if (hasEnoughMinutes) {
    return null // Don't render anything if user has enough minutes
  }

  return (
    <WalletCheck
      onProceed={handleProceed}
      onCancel={handleCancel}
      requiredMinutes={requiredMinutes}
    />
  )
}
