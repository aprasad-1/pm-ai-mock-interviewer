'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { consumeWalletTime } from '@/lib/actions/user.action'

interface UseInterviewTimerProps {
  userId: string
  initialMinutes: number
  onWalletUpdate?: (remainingMinutes: number) => void
  onTimerEnd?: () => void
}

export function useInterviewTimer({
  userId,
  initialMinutes,
  onWalletUpdate,
  onTimerEnd
}: UseInterviewTimerProps) {
  const [remainingMinutes, setRemainingMinutes] = useState(initialMinutes)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  // Use refs to persist values across renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const totalElapsedRef = useRef<number>(0)
  const lastSyncTimeRef = useRef<number>(0)
  const isUpdatingRef = useRef<boolean>(false)

  // Start the timer
  const startTimer = useCallback(() => {
    if (isRunning || remainingMinutes <= 0) return
    
    console.log('⏱️ Starting interview timer...')
    setIsRunning(true)
    startTimeRef.current = Date.now() - (totalElapsedRef.current * 1000)
    lastSyncTimeRef.current = Date.now()
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const totalElapsed = Math.floor((now - startTimeRef.current) / 1000)
      totalElapsedRef.current = totalElapsed
      setElapsedSeconds(totalElapsed)
      
      // Calculate remaining minutes
      const minutesUsed = Math.ceil(totalElapsed / 60)
      const newRemaining = Math.max(0, initialMinutes - minutesUsed)
      
      // Check if we've run out of time
      if (newRemaining <= 0 && !isUpdatingRef.current) {
        console.log('⏰ Interview time expired!')
        stopTimer()
        if (onTimerEnd) onTimerEnd()
        return
      }
      
      // Sync with database every 30 seconds
      if (now - lastSyncTimeRef.current >= 30000 && !isUpdatingRef.current) {
        syncWalletTime()
      }
    }, 1000)
  }, [isRunning, remainingMinutes, initialMinutes])

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (!isRunning) return
    
    console.log('⏹️ Stopping interview timer...')
    setIsRunning(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Final sync when stopping
    if (totalElapsedRef.current > 0) {
      syncWalletTime(true)
    }
  }, [isRunning])

  // Sync wallet time with database
  const syncWalletTime = useCallback(async (isFinal = false) => {
    if (isUpdatingRef.current) return
    
    const secondsToSync = totalElapsedRef.current - Math.floor(lastSyncTimeRef.current / 1000)
    if (secondsToSync <= 0 && !isFinal) return
    
    isUpdatingRef.current = true
    
    try {
      console.log(`🔄 Syncing ${secondsToSync} seconds to wallet...`)
      const success = await consumeWalletTime(userId, secondsToSync)
      
      if (success) {
        lastSyncTimeRef.current = Date.now()
        const minutesUsed = Math.ceil(totalElapsedRef.current / 60)
        const newRemaining = Math.max(0, initialMinutes - minutesUsed)
        setRemainingMinutes(newRemaining)
        
        if (onWalletUpdate) {
          onWalletUpdate(newRemaining)
        }
        
        console.log(`✅ Wallet synced. Remaining: ${newRemaining} minutes`)
      } else {
        console.error('❌ Failed to sync wallet time')
      }
    } catch (error) {
      console.error('❌ Error syncing wallet:', error)
    } finally {
      isUpdatingRef.current = false
    }
  }, [userId, initialMinutes, onWalletUpdate])

  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (!isRunning) return
    
    console.log('⏸️ Pausing interview timer...')
    setIsRunning(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Don't reset elapsed time when pausing
  }, [isRunning])

  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (isRunning || remainingMinutes <= 0) return
    
    console.log('▶️ Resuming interview timer...')
    startTimer()
  }, [isRunning, remainingMinutes, startTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Sync any remaining time when component unmounts
      if (totalElapsedRef.current > 0 && isRunning) {
        syncWalletTime(true)
      }
    }
  }, [isRunning, syncWalletTime])

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    remainingMinutes,
    elapsedSeconds,
    isRunning,
    formattedTime: formatTime(elapsedSeconds),
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    syncWalletTime
  }
}
