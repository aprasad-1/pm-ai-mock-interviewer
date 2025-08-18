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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400 bg-green-400/10'
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTypeColor = (id: string) => {
    switch (id) {
      case 'product-design':
        return 'text-blue-400 bg-blue-400/10'
      case 'product-strategy':
        return 'text-purple-400 bg-purple-400/10'
      case 'analytical-metrics':
        return 'text-green-400 bg-green-400/10'
      case 'execution-problem-solving':
        return 'text-orange-400 bg-orange-400/10'
      case 'estimation-market-sizing':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'behavioral-cultural-fit':
        return 'text-indigo-400 bg-indigo-400/10'
      case 'technical-pm':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

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
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(questionSet.id)}`}>
                {questionSet.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(questionSet.difficulty)}`}>
                {questionSet.difficulty}
              </span>
            </div>
          </div>

          <p className="text-light-100 text-sm">
            {questionSet.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-light-100">
            <span>{questionSet.duration} min</span>
            <span className="hidden sm:inline">•</span>
            <span>{questionSet.questions.length} questions in bank</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm text-primary-200">Random selection</span>
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
