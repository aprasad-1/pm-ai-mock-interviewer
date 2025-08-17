"use client";

import React, { useState } from 'react'
import { InterviewFeedback } from '@/lib/actions/general.action'
import InterviewFeedbackModal from './InterviewFeedbackModal'

interface InterviewFeedbackCardProps {
  feedbackData: {
    id: string
    userId: string
    transcriptId: string
    interviewId?: string
    feedback: InterviewFeedback
    analyzedAt: string
  }
}

const InterviewFeedbackCard = ({ feedbackData }: InterviewFeedbackCardProps) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent'
    if (score >= 8) return 'Very Good'
    if (score >= 7) return 'Good'
    if (score >= 6) return 'Fair'
    if (score >= 5) return 'Below Average'
    return 'Needs Improvement'
  }

  const getTopCategories = () => {
    return feedbackData.feedback.categoryScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
  }

  const handleCardClick = () => {
    setShowFeedbackModal(true);
  };

  return (
    <>
      <div 
        className="card-border cursor-pointer hover:border-primary-200/40 transition-colors h-full"
        onClick={handleCardClick}
      >
        <div className="card p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-6">
            {/* Left side - Interview Info */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                Interview Analysis
              </h3>
              <div className="flex items-center gap-2 text-light-100">
                <svg className="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-medium">{formatDate(feedbackData.analyzedAt)}</span>
              </div>
            </div>

            {/* Right side - Score */}
            <div className="text-right">
              <div className="flex flex-col items-end">
                <div className={`text-3xl font-bold mb-1 ${getScoreColor(feedbackData.feedback.totalScore)}`}>
                  {feedbackData.feedback.totalScore}/10
                </div>
                <div className="text-sm text-light-400">{getScoreLabel(feedbackData.feedback.totalScore)}</div>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-light-200 mb-3">Top Performing Areas</h4>
            <div className="space-y-2">
              {getTopCategories().map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-light-100">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.round(category.score / 2) 
                              ? 'bg-primary-200' 
                              : 'bg-dark-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(category.score)}`}>
                      {category.score}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths Preview */}
          <div className="flex-1 mb-4">
            <h4 className="text-sm font-medium text-light-200 mb-2">Key Strengths</h4>
            <div className="space-y-1">
              {feedbackData.feedback.strengths.slice(0, 2).map((strength, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2 h-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-light-100 line-clamp-2">{strength}</p>
                </div>
              ))}
              {feedbackData.feedback.strengths.length > 2 && (
                <p className="text-xs text-light-400 ml-6">
                  +{feedbackData.feedback.strengths.length - 2} more strengths
                </p>
              )}
            </div>
          </div>

          {/* Click to expand hint - Always at bottom */}
          <div className="flex items-center justify-between mt-auto">
            <div className="text-xs text-light-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Click to view complete analysis
            </div>
            
            <div className="flex items-center gap-1 text-xs text-light-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <InterviewFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        feedback={feedbackData.feedback}
        interviewTitle="Interview Analysis"
        date={feedbackData.analyzedAt}
      />
    </>
  )
}

export default InterviewFeedbackCard
