'use client'

import React from 'react'
import { Clock } from 'lucide-react'

interface WalletDisplayProps {
  minutes: number
  className?: string
}

export default function WalletDisplay({ minutes, className = '' }: WalletDisplayProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-success-200/10 rounded-full border border-success-200/20 ${className}`}>
      <Clock className="w-4 h-4 text-success-200" />
      <span className="text-xs sm:text-sm text-success-200">
        {minutes} minutes remaining
      </span>
    </div>
  )
}
