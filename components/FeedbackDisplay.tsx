'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CallTranscript, InterviewFeedback, analyzeTranscript } from '@/lib/actions/general.action'
import { toast } from 'sonner'
import { ArrowLeft, Brain, Clock, User } from 'lucide-react'

interface FeedbackDisplayProps {
  transcript: CallTranscript
  userId: string
}

const FeedbackDisplay = ({ transcript, userId }: FeedbackDisplayProps) => {
  const router = useRouter()
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const handleAnalyzeTranscript = async () => {
    try {
      setIsAnalyzing(true)
      toast.loading('Analyzing your interview...')
      
      const result = await analyzeTranscript({
        transcriptId: transcript.id,
        interviewQuestions: [
          "How would you design a product for elderly users?",
          "Walk me through how you would improve the user experience of a mobile banking app.",
          "How would you prioritize features for a new social media platform?",
          "Describe your process for conducting user research.",
          "How would you design a product that serves both B2B and B2C markets?"
        ]
      })

      if (result.success) {
        setFeedback(result.feedback)
        setHasAnalyzed(true)
        toast.dismiss()
        toast.success('Analysis complete!')
      }
    } catch (error) {
      console.error('Error analyzing transcript:', error)
      toast.dismiss()
      toast.error('Failed to analyze transcript. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-400/10 border-green-400/20'
    if (score >= 6) return 'bg-yellow-400/10 border-yellow-400/20'
    return 'bg-red-400/10 border-red-400/20'
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4 px-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      {/* Interview Summary */}
      <div className="card-border">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Interview Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-200" />
              <div>
                <p className="text-sm text-light-400">Duration</p>
                <p className="text-white font-medium">{formatDuration(transcript.callDuration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary-200" />
              <div>
                <p className="text-sm text-light-400">Interview Type</p>
                <p className="text-white font-medium">Product Design Questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary-200" />
              <div>
                <p className="text-sm text-light-400">Date</p>
                <p className="text-white font-medium">
                  {new Date(transcript.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="card-border">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Interview Transcript</h2>
          <div className="bg-dark-300 rounded-lg p-4 max-h-96 overflow-y-auto">
            {transcript.transcript.length > 0 ? (
              <div className="space-y-3">
                {transcript.transcript.map((message, index) => {
                  // Parse the message to extract speaker and content
                  let speaker = '';
                  let content = message;
                  
                  // Check if message already has speaker format (Speaker: message)
                  if (message.includes(':')) {
                    const colonIndex = message.indexOf(':');
                    const potentialSpeaker = message.substring(0, colonIndex).trim();
                    
                    // If it looks like a speaker name (Interviewer, You, etc.)
                    if (potentialSpeaker === 'Interviewer' || potentialSpeaker === 'You') {
                      speaker = potentialSpeaker;
                      content = message.substring(colonIndex + 1).trim();
                    } else {
                      // This might be a malformed entry, skip if it's too short or looks wrong
                      if (message.trim().length < 10) {
                        return null; // Skip very short/incomplete entries
                      }
                      // Fallback to alternating pattern
                      speaker = index % 2 === 0 ? 'Interviewer' : 'You';
                      content = message;
                    }
                  } else {
                    // No colon found - check if it's a complete message
                    if (message.trim().length < 10) {
                      return null; // Skip very short entries
                    }
                    // Fallback to alternating pattern
                    speaker = index % 2 === 0 ? 'Interviewer' : 'You';
                    content = message;
                  }
                  
                  // Skip empty content
                  if (!content.trim()) {
                    return null;
                  }
                  
                  return (
                    <div key={`${index}-${speaker}`} className="text-light-100 leading-relaxed mb-3">
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
              <p className="text-light-400 text-center py-8">
                No transcript available for this interview.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="card-border">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">AI Analysis</h2>
          
          {!hasAnalyzed && !feedback ? (
            <div className="text-center py-8">
              <p className="text-light-100 mb-6">
                Get detailed AI-powered feedback on your interview performance
              </p>
              <Button 
                onClick={handleAnalyzeTranscript}
                disabled={isAnalyzing}
                className="btn-primary"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Transcript'}
              </Button>
            </div>
          ) : feedback ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-2 ${getScoreBg(feedback.totalScore)}`}>
                  <span className={`text-3xl font-bold ${getScoreColor(feedback.totalScore)}`}>
                    {feedback.totalScore}/10
                  </span>
                </div>
                <p className="text-light-100 mt-2">Overall Score</p>
              </div>

              {/* Category Scores */}
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedback.categoryScores.map((category, index) => (
                  <div key={index} className="bg-dark-300 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <span className={`font-bold ${getScoreColor(category.score)}`}>
                        {category.score}/10
                      </span>
                    </div>
                    <p className="text-light-100 text-sm">{category.comment}</p>
                  </div>
                ))}
              </div>

              {/* Strengths and Areas for Improvement */}
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-green-400 flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-light-100">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {feedback.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-yellow-400 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">→</span>
                        <span className="text-light-100">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Final Assessment */}
              <div>
                <h3 className="font-semibold text-white mb-3">Final Assessment</h3>
                <p className="text-light-100 bg-dark-300 p-4 rounded-lg">
                  {feedback.finalAssessment}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
                   <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
               <Link href="/" className="w-full sm:w-auto">
                 <Button className="btn-secondary w-full sm:w-auto min-h-[44px]">
                   Back to Home
                 </Button>
               </Link>
               <Link href="/interview?type=product-design" className="w-full sm:w-auto">
                 <Button className="btn-primary w-full sm:w-auto min-h-[44px]">
                   Take Another Interview
                 </Button>
               </Link>
             </div>
    </div>
  )
}

export default FeedbackDisplay
