'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { consumeWalletTime } from '@/lib/actions/user.action'
import WalletDepletedModal from './WalletDepletedModal'

interface CleanInterviewTimerProps {
  isActive: boolean
  userId: string
  initialWalletMinutes: number
  onWalletDepleted?: () => void
}

export default function CleanInterviewTimer({ 
  isActive, 
  userId, 
  initialWalletMinutes,
  onWalletDepleted
}: CleanInterviewTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [showDepletedModal, setShowDepletedModal] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Format time helper
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Sync time to server (only called at end of session)
  const syncTime = async (secondsToSync: number) => {
    if (secondsToSync <= 0) return

    try {
      console.log(`📤 Final sync: ${secondsToSync} seconds (${Math.ceil(secondsToSync / 60)} minutes will be charged)`)
      await consumeWalletTime(userId, secondsToSync)
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  // Main timer effect - ONLY depends on isActive
  useEffect(() => {
    console.log(`🔍 CleanTimer: isActive=${isActive}`)
    
    if (isActive) {
      // Start timer
      console.log('▶️ Starting clean timer')
      setSeconds(0)
      startTimeRef.current = Date.now()
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Start new interval
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current) / 1000)
        setSeconds(elapsed)
        
        // Check if we should stop based on wallet limit
        // Only stop when we've ACTUALLY used more time than available
        // Give users the full minute they paid for
        const minutesUsed = Math.ceil(elapsed / 60)
        const actualMinutesInWallet = initialWalletMinutes
        
        // Only stop if we've exceeded the wallet by a full minute boundary
        // This gives users their full paid time
        if (elapsed >= (actualMinutesInWallet * 60) && actualMinutesInWallet > 0) {
          console.log(`🚨 Wallet time fully used - stopping interview after ${elapsed}s (${actualMinutesInWallet} minutes allowed)`)
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          
          // Sync total session time when wallet depleted
          if (elapsed > 0) {
            syncTime(elapsed)
          }
          
          setShowDepletedModal(true)
          if (onWalletDepleted) {
            onWalletDepleted()
          }
          return
        }
        
        // Log progress every 10 seconds to show wallet usage
        if (elapsed % 10 === 0 && elapsed > 0) {
          console.log(`⏱️ ${elapsed}s elapsed (${actualMinutesInWallet} minutes available, will stop at ${actualMinutesInWallet * 60}s)`)
        }
      }, 1000)
      
    } else {
      // Stop timer
      console.log('⏹️ Stopping clean timer')
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        
        // Sync total session time when interview ends normally
        const totalSessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        console.log(`📊 Interview ended. Total session time: ${totalSessionTime} seconds`)
        
        if (totalSessionTime > 0) {
          syncTime(totalSessionTime)
        }
      }
    }
  }, [isActive]) // ONLY depend on isActive

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <>
      <div className="inline-flex items-center gap-3 bg-dark-200 rounded-lg px-4 py-3 border border-light-800/50 shadow-lg">
        <div className="transition-all">
          <Clock className="w-5 h-5 text-success-200" />
        </div>
        
        <div>
          <div className="text-2xl font-mono font-bold text-white">
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* Wallet Depleted Modal */}
      <WalletDepletedModal
        isOpen={showDepletedModal}
        onClose={() => setShowDepletedModal(false)}
        timeUsed={formatTime(seconds)}
      />
    </>
  )
}
