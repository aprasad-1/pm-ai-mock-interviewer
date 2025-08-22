'use client'

import React, { useState, useEffect, useRef } from 'react'
import { consumeWalletTime } from '@/lib/actions/user.action'
import { Clock, AlertTriangle } from 'lucide-react'

interface WalletTimerProps {
  userId: string
  initialMinutes: number
  isInterviewActive: boolean
  onWalletUpdate: (newMinutes: number) => void
}

export default function WalletTimer({ 
  userId, 
  initialMinutes, 
  isInterviewActive, 
  onWalletUpdate 
}: WalletTimerProps) {
  const [currentMinutes, setCurrentMinutes] = useState(initialMinutes)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Start timer when interview becomes active
  useEffect(() => {
    if (isInterviewActive && !isRunning) {
      startTimer()
    } else if (!isInterviewActive && isRunning) {
      stopTimer()
    }
  }, [isInterviewActive, isRunning])

  // Debug logging
  useEffect(() => {
    console.log('WalletTimer: isInterviewActive changed to:', isInterviewActive)
  }, [isInterviewActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startTimer = () => {
    setIsRunning(true)
    startTimeRef.current = Date.now()
    setLastUpdateTime(Date.now())
    
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const newElapsedSeconds = Math.floor((now - startTimeRef.current) / 1000)
      setElapsedSeconds(newElapsedSeconds)
      
      // Update wallet every 30 seconds (0.5 minutes)
      if (now - lastUpdateTime >= 30000) {
        updateWallet(newElapsedSeconds)
        setLastUpdateTime(now)
      }
    }, 1000)
  }

  const stopTimer = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Final wallet update when timer stops
    if (elapsedSeconds > 0) {
      updateWallet(elapsedSeconds)
    }
  }

  const updateWallet = async (totalSeconds: number) => {
    try {
      const success = await consumeWalletTime(userId, totalSeconds)
      if (success) {
        // Calculate new minutes remaining
        const minutesUsed = Math.ceil(totalSeconds / 60)
        const newMinutes = initialMinutes - minutesUsed
        setCurrentMinutes(newMinutes)
        onWalletUpdate(newMinutes)
        
        // Reset elapsed time after successful update
        setElapsedSeconds(0)
        startTimeRef.current = Date.now()
      }
    } catch (error) {
      console.error('Failed to update wallet:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWarningLevel = () => {
    if (currentMinutes <= 1) return 'critical'
    if (currentMinutes <= 5) return 'warning'
    return 'normal'
  }

  const warningLevel = getWarningLevel()

  return (
    <div className="bg-dark-200 rounded-lg p-4 border border-light-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-200" />
          <h3 className="text-lg font-semibold text-light-100">Interview Timer</h3>
        </div>
        
        {warningLevel === 'critical' && (
          <div className="flex items-center gap-1 text-destructive-200">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Low Balance!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Wallet Balance */}
        <div className="text-center">
          <div className="text-2xl font-bold text-success-200 mb-1">
            {currentMinutes}
          </div>
          <div className="text-sm text-light-600">minutes remaining</div>
        </div>

        {/* Interview Time */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-200 mb-1">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="text-sm text-light-600">interview time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-light-600 mb-1">
          <span>Used: {Math.ceil(elapsedSeconds / 60)} min</span>
          <span>Total: {initialMinutes} min</span>
        </div>
        <div className="w-full bg-dark-300 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              warningLevel === 'critical' ? 'bg-destructive-200' :
              warningLevel === 'warning' ? 'bg-warning-200' : 'bg-success-200'
            }`}
            style={{ 
              width: `${Math.min((elapsedSeconds / 60 / initialMinutes) * 100, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 text-center">
        <div className={`text-sm ${
          isRunning ? 'text-success-200' : 'text-light-600'
        }`}>
          {isRunning ? 'Interview in progress...' : 'Interview paused'}
        </div>
      </div>
    </div>
  )
}
