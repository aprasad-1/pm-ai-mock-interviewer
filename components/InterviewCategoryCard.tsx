'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { QuestionSet } from '@/lib/interview-templates'
import { Button } from '@/components/ui/button'

interface InterviewCategoryCardProps {
  questionSet: QuestionSet
}

const InterviewCategoryCard = ({ questionSet }: InterviewCategoryCardProps) => {
  const router = useRouter()

  const handleStartInterview = async () => {
    try {
      // Navigate to interview page with category parameters
      const searchParams = new URLSearchParams({
        categoryId: questionSet.id,
        type: questionSet.category,
        title: questionSet.title
      })
      
      router.push(`/interview?${searchParams.toString()}`)
      
    } catch (error) {
      console.error('Error starting interview:', error)
    }
  }

  return (
    <div className="card-border">
      <div className="card-interview">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-white">{questionSet.title}</h3>
          </div>

          <p className="text-light-100 text-sm">
            {questionSet.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-light-100">
            <span>{questionSet.duration} min</span>
            <span className="hidden sm:inline">•</span>
            <span>{questionSet.questions.length} questions in bank</span>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button 
            className="btn-primary min-h-[44px] w-full sm:w-auto"
            size="sm"
            onClick={handleStartInterview}
          >
            Start Practice
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCategoryCard
