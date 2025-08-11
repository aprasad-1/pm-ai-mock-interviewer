import React from 'react'
import { Interview } from '@/lib/actions/general.action'
import { Button } from '@/components/ui/button'

interface InterviewCardProps {
  interview: Interview
  isUserInterview?: boolean
}

const InterviewCard = ({ interview, isUserInterview = false }: InterviewCardProps) => {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'text-blue-400 bg-blue-400/10'
      case 'behavioral':
        return 'text-purple-400 bg-purple-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="card-border">
      <div className="card-interview">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-white">{interview.role}</h3>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(interview.type)}`}>
                {interview.type}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(interview.difficulty)}`}>
                {interview.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-light-100">
            <span>{interview.duration} min</span>
            <span>•</span>
            <span>{interview.technologies.length} technologies</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {interview.technologies.map((tech, index) => (
              <div key={index} className="group relative">
                <div className="w-8 h-8 bg-dark-200 rounded-full flex items-center justify-center text-xs font-bold text-primary-200">
                  {tech.charAt(0).toUpperCase()}
                </div>
                <span className="tech-tooltip">
                  {tech}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-light-400">
            Created {new Date(interview.createdAt).toLocaleDateString()}
          </div>
          <Button 
            className={isUserInterview ? "btn-secondary" : "btn-primary"}
            size="sm"
          >
            {isUserInterview ? 'Resume' : 'Start Interview'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard
