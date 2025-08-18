"use client";

import React from 'react';
import { InterviewFeedback } from '@/lib/actions/general.action';
import { Button } from '@/components/ui/button';

interface TranscriptData {
  transcript: string[]
  callDuration: number
  callStartTime: string
  callEndTime: string
}

interface InterviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: InterviewFeedback;
  interviewTitle: string;
  date: string;
  transcriptData?: TranscriptData | null;
}

const InterviewFeedbackModal = ({ 
  isOpen, 
  onClose, 
  feedback, 
  interviewTitle, 
  date,
  transcriptData 
}: InterviewFeedbackModalProps) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 6) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    if (score >= 5) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-dark-100 rounded-lg border border-dark-200 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-dark-200">
          <div className="flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{interviewTitle}</h2>
            <p className="text-sm sm:text-base text-light-400">Interview completed on {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <button
            onClick={onClose}
            className="text-light-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-4 px-8 py-6 rounded-lg border ${getScoreColor(feedback.totalScore)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold">{feedback.totalScore}</div>
                <div className="text-sm opacity-80">out of 10</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{getScoreLabel(feedback.totalScore)}</div>
                <div className="text-sm opacity-80">Overall Performance</div>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Detailed Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {feedback.categoryScores.map((category, index) => (
                <div key={index} className="card-border">
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(category.score)}`}>
                        {category.score}/10
                      </div>
                    </div>
                    
                    {/* Score visualization */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < category.score 
                              ? 'bg-primary-200' 
                              : 'bg-dark-200'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-light-100 text-sm">{category.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Key Strengths</h3>
            <div className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-light-100">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Areas for Improvement</h3>
            <div className="space-y-3">
              {feedback.areasForImprovement.map((area, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-light-100">{area}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Section */}
          {transcriptData && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Interview Transcript</h3>
              <div className="card-border">
                <div className="card p-6">
                  <div className="flex items-center gap-4 mb-4 text-sm text-light-400">
                    <span>Duration: {Math.floor(transcriptData.callDuration / 60)}m {transcriptData.callDuration % 60}s</span>
                    <span>•</span>
                    <span>Date: {new Date(transcriptData.callStartTime).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-dark-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {transcriptData.transcript.length > 0 ? (
                      <div className="space-y-3">
                        {transcriptData.transcript.map((message, index) => {
                          let speaker = '';
                          let content = message;

                          if (message.includes(':')) {
                            const colonIndex = message.indexOf(':');
                            const potentialSpeaker = message.substring(0, colonIndex).trim();

                            if (potentialSpeaker === 'Interviewer' || potentialSpeaker === 'You') {
                              speaker = potentialSpeaker;
                              content = message.substring(colonIndex + 1).trim();
                            } else {
                              speaker = index % 2 === 0 ? 'Interviewer' : 'You';
                              content = message;
                            }
                          } else {
                            speaker = index % 2 === 0 ? 'Interviewer' : 'You';
                            content = message;
                          }

                          if (!content.trim()) return null;

                          return (
                            <div key={`${index}-${speaker}`} className="text-light-100 leading-relaxed">
                              <div className="flex flex-col">
                                <span className="text-primary-200 font-medium text-sm mb-1">
                                  {speaker}
                                </span>
                                <span className="text-light-100 pl-4 border-l-2 border-primary-200/20">
                                  {content}
                                </span>
                              </div>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    ) : (
                      <p className="text-light-400 text-center py-4">
                        No transcript available for this interview.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Assessment */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Final Assessment</h3>
            <div className="card-border">
              <div className="card p-6">
                <p className="text-light-100 leading-relaxed">{feedback.finalAssessment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-dark-200">
          <Button variant="outline" onClick={onClose} className="text-primary-200 border-primary-200 hover:bg-primary-200/10">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedbackModal;
