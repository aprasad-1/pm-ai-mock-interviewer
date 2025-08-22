'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { consumeWalletTime } from '@/lib/actions/user.action'

interface InterviewTimerClientProps {
  isActive: boolean
  userId: string
  onTimeUpdate?: (seconds: number) => void
}

export default function InterviewTimerClient({ 
  isActive, 
  userId,
  onTimeUpdate 
}: InterviewTimerClientProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  // Use refs to persist values
  const startTimeRef = useRef<number>(0)
  const accumulatedTimeRef = useRef<number>(0)
  const lastSyncTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && !isRunning) {
      // Start the timer
      console.log('⏱️ Starting interview timer')
      setIsRunning(true)
      startTimeRef.current = Date.now()
      lastSyncTimeRef.current = Date.now()
      
      // Start interval for UI updates
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const currentSessionTime = Math.floor((now - startTimeRef.current) / 1000)
        const totalTime = accumulatedTimeRef.current + currentSessionTime
        setElapsedSeconds(totalTime)
        
        // Sync every 30 seconds
        if (now - lastSyncTimeRef.current >= 30000) {
          syncTimeToServer(currentSessionTime)
          lastSyncTimeRef.current = now
        }
      }, 1000)
      
    } else if (!isActive && isRunning) {
      // Stop the timer
      console.log('⏹️ Stopping interview timer')
      setIsRunning(false)
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      // Final sync
      const finalSessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
      if (finalSessionTime > 0) {
        syncTimeToServer(finalSessionTime)
      }
      
      // Reset for next session
      accumulatedTimeRef.current = 0
      setElapsedSeconds(0)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isRunning])

  const syncTimeToServer = async (sessionSeconds: number) => {
    if (sessionSeconds <= 0) return
    
    try {
      console.log(`🔄 Syncing ${sessionSeconds} seconds to server`)
      const success = await consumeWalletTime(userId, sessionSeconds)
      
      if (success) {
        // Reset session time after successful sync
        accumulatedTimeRef.current += sessionSeconds
        startTimeRef.current = Date.now()
        console.log('✅ Time synced successfully')
      } else {
        console.error('❌ Failed to sync time')
      }
    } catch (error) {
      console.error('❌ Error syncing time:', error)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Call the callback if provided
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(elapsedSeconds)
    }
  }, [elapsedSeconds, onTimeUpdate])

  return (
    <div className="inline-flex items-center gap-3 bg-dark-200/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-light-800/50 shadow-xl">
      <div className={`transition-all ${isRunning ? 'animate-pulse' : ''}`}>
        <Clock className={`w-5 h-5 ${isRunning ? 'text-success-200' : 'text-light-600'}`} />
      </div>
      
      <div className="flex flex-col">
        <div className="text-2xl font-mono font-bold text-white tracking-wider">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-xs text-light-600">
          {isRunning ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-success-200 rounded-full animate-pulse"></span>
              Recording time
            </span>
          ) : (
            'Timer ready'
          )}
        </div>
      </div>
    </div>
  )
}
