'use client'

import React, { useEffect } from 'react'
import { Clock, AlertTriangle, Pause, Play } from 'lucide-react'
import { useInterviewTimer } from '@/hooks/useInterviewTimer'
import { Button } from '@/components/ui/button'

interface InterviewTimerProps {
  userId: string
  initialMinutes: number
  isInterviewActive: boolean
  onTimerEnd?: () => void
}

export default function InterviewTimer({ 
  userId, 
  initialMinutes, 
  isInterviewActive,
  onTimerEnd
}: InterviewTimerProps) {
  const {
    remainingMinutes,
    elapsedSeconds,
    isRunning,
    formattedTime,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  } = useInterviewTimer({
    userId,
    initialMinutes,
    onWalletUpdate: (minutes) => {
      console.log('💰 Wallet updated:', minutes, 'minutes remaining')
    },
    onTimerEnd
  })

  // Start/stop timer based on interview state
  useEffect(() => {
    if (isInterviewActive && !isRunning) {
      startTimer()
    } else if (!isInterviewActive && isRunning) {
      stopTimer()
    }
  }, [isInterviewActive, isRunning, startTimer, stopTimer])

  const getWarningLevel = () => {
    if (remainingMinutes <= 1) return 'critical'
    if (remainingMinutes <= 5) return 'warning'
    return 'normal'
  }

  const warningLevel = getWarningLevel()
  const percentageUsed = Math.min((elapsedSeconds / 60 / initialMinutes) * 100, 100)

  return (
    <div className="bg-dark-200 rounded-lg p-4 border border-light-800 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-200" />
          <h3 className="text-lg font-semibold text-light-100">Interview Timer</h3>
        </div>
        
        {warningLevel !== 'normal' && (
          <div className="flex items-center gap-1 animate-pulse">
            <AlertTriangle className={`w-4 h-4 ${
              warningLevel === 'critical' ? 'text-destructive-200' : 'text-warning-200'
            }`} />
            <span className={`text-sm font-medium ${
              warningLevel === 'critical' ? 'text-destructive-200' : 'text-warning-200'
            }`}>
              {warningLevel === 'critical' ? 'Time Critical!' : 'Low Balance'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Wallet Balance */}
        <div className="bg-dark-300 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold mb-1 ${
            warningLevel === 'critical' ? 'text-destructive-200' :
            warningLevel === 'warning' ? 'text-warning-200' : 'text-success-200'
          }`}>
            {remainingMinutes}
          </div>
          <div className="text-xs text-light-600">minutes remaining</div>
        </div>

        {/* Interview Time */}
        <div className="bg-dark-300 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary-200 mb-1">
            {formattedTime}
          </div>
          <div className="text-xs text-light-600">elapsed time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-light-600 mb-1">
          <span>Used: {Math.ceil(elapsedSeconds / 60)} min</span>
          <span>{Math.round(percentageUsed)}%</span>
        </div>
        <div className="w-full bg-dark-300 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 transition-all duration-1000 ease-linear ${
              warningLevel === 'critical' ? 'bg-destructive-200' :
              warningLevel === 'warning' ? 'bg-warning-200' : 'bg-success-200'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>

      {/* Status and Controls */}
      <div className="flex items-center justify-between">
        <div className={`text-sm font-medium ${
          isRunning ? 'text-success-200' : 'text-light-600'
        }`}>
          {isRunning ? '● Recording Time' : '○ Timer Paused'}
        </div>
        
        {/* Manual controls for testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex gap-2">
            {isRunning ? (
              <Button
                onClick={pauseTimer}
                size="sm"
                variant="outline"
                className="h-7 px-2"
              >
                <Pause className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                onClick={resumeTimer}
                size="sm"
                variant="outline"
                className="h-7 px-2"
              >
                <Play className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Critical warning message */}
      {warningLevel === 'critical' && (
        <div className="mt-3 p-2 bg-destructive-200/10 border border-destructive-200/20 rounded-lg">
          <p className="text-xs text-destructive-200 text-center">
            ⚠️ You have less than 1 minute remaining. Interview will end soon.
          </p>
        </div>
      )}
    </div>
  )
}
