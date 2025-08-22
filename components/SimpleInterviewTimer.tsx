'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Clock } from 'lucide-react'

interface SimpleInterviewTimerProps {
  isInterviewActive: boolean
  userId: string
  onTimerStop?: (secondsUsed: number) => void
}

export default function SimpleInterviewTimer({ 
  isInterviewActive,
  userId,
  onTimerStop
}: SimpleInterviewTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastSyncRef = useRef<number>(0)

  // Start timer when interview becomes active
  useEffect(() => {
    if (isInterviewActive && !isRunning) {
      console.log('🚀 Starting timer...')
      setIsRunning(true)
      startTimeRef.current = Date.now()
      lastSyncRef.current = Date.now()
      setSeconds(0)
      
      // Start the interval
      if (intervalRef.current) clearInterval(intervalRef.current)
      
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current) / 1000)
        setSeconds(elapsed)
        
        // Sync every 30 seconds
        if (now - lastSyncRef.current >= 30000) {
          console.log(`📊 Time checkpoint: ${elapsed} seconds`)
          lastSyncRef.current = now
          // In a real implementation, you'd sync with the server here
        }
      }, 1000)
      
    } else if (!isInterviewActive && isRunning) {
      console.log('⏹️ Stopping timer...')
      setIsRunning(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      const totalSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
      console.log(`⏱️ Total time: ${totalSeconds} seconds`)
      
      if (onTimerStop && totalSeconds > 0) {
        onTimerStop(totalSeconds)
      }
    }
  }, [isInterviewActive, isRunning, onTimerStop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-dark-200/80 backdrop-blur rounded-lg px-4 py-3 border border-light-800/50 shadow-lg">
      <div className="flex items-center gap-3">
        <div className={`${isRunning ? 'animate-pulse' : ''}`}>
          <Clock className={`w-5 h-5 ${isRunning ? 'text-success-200' : 'text-light-600'}`} />
        </div>
        <div className="flex flex-col">
          <div className="text-2xl font-mono font-bold text-light-100">
            {formatTime(seconds)}
          </div>
          <div className="text-xs text-light-600">
            {isRunning ? 'Recording interview time' : 'Timer ready'}
          </div>
        </div>
      </div>
    </div>
  )
}