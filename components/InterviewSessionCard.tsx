"use client";

import React, { useState } from 'react'
import { InterviewSession, InterviewFeedback } from '@/lib/actions/general.action'
import { Button } from '@/components/ui/button'
import InterviewFeedbackModal from './InterviewFeedbackModal'

interface InterviewSessionCardProps {
  session: InterviewSession
  feedback?: InterviewFeedback
}

const InterviewSessionCard = ({ session, feedback }: InterviewSessionCardProps) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10'
      case 'in_progress':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'cancelled':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const handleCardClick = () => {
    if (feedback && session.status === 'completed') {
      setShowFeedbackModal(true);
    }
  };

  return (
    <>
      <div 
        className={`card-border ${feedback && session.status === 'completed' ? 'cursor-pointer hover:border-primary-200/40 transition-colors' : ''}`}
        onClick={handleCardClick}
      >
        <div className="card p-6">
          <div className="flex items-start justify-between mb-6">
            {/* Left side - Title and Date */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{session.interviewTitle}</h3>
              <div className="flex items-center gap-2 text-light-100">
                <svg className="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-medium">{formatDate(session.createdAt)}</span>
              </div>
            </div>

            {/* Right side - Score */}
            <div className="text-right">
              {session.score ? (
                <div className="flex flex-col items-end">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(session.score)}`}>
                    {session.score}/10
                  </div>
                  <div className="text-sm text-light-400">Overall Score</div>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-light-400 mb-1">
                    --
                  </div>
                  <div className="text-sm text-light-400">No Score</div>
                </div>
              )}
            </div>
          </div>

          {/* Status and Duration Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
              <div className="flex items-center gap-2 text-light-100">
                <svg className="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(session.duration)}</span>
              </div>
            </div>
          </div>

          {/* Score Visualization */}
          {session.score && (
            <div className="mb-4">
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < session.score! 
                        ? 'bg-primary-200' 
                        : 'bg-dark-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-light-400">
              {feedback && session.status === 'completed' && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Click to view detailed analysis
                </span>
              )}
              {session.status === 'in_progress' && (
                <>Started {formatDate(session.startTime)}</>
              )}
              {session.status === 'cancelled' && (
                <>Cancelled {formatDate(session.updatedAt)}</>
              )}
            </div>
            
            <div className="flex gap-2">
              {session.status === 'in_progress' && (
                <Button 
                  className="btn-primary"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          feedback={feedback}
          interviewTitle={session.interviewTitle}
          date={session.createdAt}
        />
      )}
    </>
  )
}

export default InterviewSessionCard
