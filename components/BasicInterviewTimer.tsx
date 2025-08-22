'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

interface BasicInterviewTimerProps {
  isActive: boolean
  userId: string
}

export default function BasicInterviewTimer({ isActive, userId }: BasicInterviewTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    console.log(`Timer: isActive=${isActive}`)
    
    if (isActive) {
      // Start timer
      console.log('▶️ Starting timer')
      setSeconds(0)
      startTimeRef.current = Date.now()
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Start new interval
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setSeconds(elapsed)
      }, 1000)
      
      setIsRunning(true)
      
    } else {
      // Stop timer if it was running
      console.log('⏹️ Stopping timer')
      setIsRunning(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        
        // Log final time
        const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        console.log(`Final time: ${finalTime} seconds`)
        
        // Sync with server
        if (finalTime > 0) {
          syncTime(finalTime)
        }
      }
    }
  }, [isActive]) // Only depend on isActive

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const syncTime = async (totalSeconds: number) => {
    try {
      console.log(`📤 Syncing ${totalSeconds} seconds to server for user ${userId}`)
      // Import and call the server action
      const { consumeWalletTime } = await import('@/lib/actions/user.action')
      const success = await consumeWalletTime(userId, totalSeconds)
      console.log(success ? '✅ Time synced' : '❌ Sync failed')
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="inline-flex items-center gap-3 bg-dark-200 rounded-lg px-4 py-3 border border-light-800/50 shadow-lg">
      <Clock className={`w-5 h-5 ${isRunning ? 'text-success-200 animate-pulse' : 'text-light-600'}`} />
      <div>
        <div className="text-2xl font-mono font-bold text-white">
          {formatTime(seconds)}
        </div>
        <div className="text-xs text-light-600">
          {isRunning ? 'Recording' : 'Ready'}
        </div>
      </div>
    </div>
  )
}
