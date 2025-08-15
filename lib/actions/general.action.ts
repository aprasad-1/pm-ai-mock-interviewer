'use server'

import { adminDb } from '@/firebase/admin'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export interface Interview {
  id: string
  role: string
  type: 'technical' | 'behavioral'
  technologies: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  userId: string
  createdAt: string
  updatedAt: string
}

export async function createSampleProductDesignInterview() {
  try {
    const sampleInterview = {
      role: "Product Design Question",
      type: "behavioral" as const,
      technologies: ["Figma", "User Research", "Prototyping", "Design Systems"],
      difficulty: "intermediate" as const,
      duration: 45,
      userId: "sample", // This makes it available to all users
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        "How would you design a product for elderly users?",
        "Walk me through how you would improve the user experience of a mobile banking app.",
        "How would you prioritize features for a new social media platform?",
        "Describe your process for conducting user research.",
        "How would you design a product that serves both B2B and B2C markets?"
      ]
    }

    const docRef = await adminDb.collection('interviews').add(sampleInterview)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error creating sample interview:', error)
    throw new Error('Failed to create sample interview')
  }
}

export async function getInterviews(userId: string) {
  try {
    // Simplified query - fetch user's interviews
    const userInterviewsQuery = adminDb
      .collection('interviews')
      .where('userId', '==', userId)
      .limit(10)

    const [userInterviewsSnapshot] = await Promise.all([
      userInterviewsQuery.get(),
    ])

    const userInterviews: Interview[] = []
    const otherInterviews: Interview[] = []

    userInterviewsSnapshot.forEach((doc) => {
      userInterviews.push({
        id: doc.id,
        ...doc.data(),
      } as Interview)
    })

    // Always provide the Product Design Questions sample for "Take an Interview"
    const sampleInterview: Interview = {
      id: "sample-product-design",
      role: "Product Design Questions",
      type: "behavioral",
      technologies: [], // No technologies to display
      difficulty: "intermediate",
      duration: 45,
      userId: "sample",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    otherInterviews.push(sampleInterview)

    return {
      userInterviews,
      otherInterviews,
    }
  } catch (error) {
    console.error('Error fetching interviews:', error)
    throw new Error('Failed to fetch interviews')
  }
}

// Interview transcript and analysis actions
export interface CallTranscript {
  id: string
  userId: string
  interviewId?: string | null
  transcript: string[]
  callDuration: number
  callStartTime: string
  callEndTime: string
  createdAt: string
}

export interface InterviewFeedback {
  totalScore: number
  categoryScores: Array<{
    name: string
    score: number
    comment: string
  }>
  strengths: string[]
  areasForImprovement: string[]
  finalAssessment: string
}

// Save transcript to Firestore after call ends
export async function saveCallTranscript(params: {
  userId: string
  interviewId?: string | null
  transcript: string[]
  callDuration: number
  callStartTime: string
  callEndTime: string
}) {
  try {
    console.log('🗃️ Server: Saving transcript with params:', {
      userId: params.userId,
      transcriptLength: params.transcript.length,
      callDuration: params.callDuration
    });

    const transcriptData: Omit<CallTranscript, 'id'> = {
      userId: params.userId,
      interviewId: params.interviewId || null, // Convert undefined to null for Firestore
      transcript: params.transcript,
      callDuration: params.callDuration,
      callStartTime: params.callStartTime,
      callEndTime: params.callEndTime,
      createdAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('transcripts').add(transcriptData)
    
    console.log('✅ Server: Transcript saved with ID:', docRef.id);
    
    return { 
      success: true, 
      transcriptId: docRef.id,
      message: 'Transcript saved successfully' 
    }
  } catch (error) {
    console.error('❌ Server: Error saving transcript:', error)
    // Return error instead of throwing to prevent crashes
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to save transcript'
    }
  }
}

// Get transcript by ID
export async function getTranscript(transcriptId: string) {
  try {
    const transcriptDoc = await adminDb.collection('transcripts').doc(transcriptId).get()
    
    if (!transcriptDoc.exists) {
      throw new Error('Transcript not found')
    }

    const transcriptData = transcriptDoc.data() as CallTranscript
    
    return { 
      success: true, 
      transcript: { ...transcriptData, id: transcriptDoc.id } as CallTranscript
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw new Error('Failed to fetch transcript')
  }
}

// Define feedback schema for AI analysis
const feedbackSchema = z.object({
  totalScore: z.number().min(1).max(10),
  categoryScores: z.array(z.object({
    name: z.string(),
    score: z.number().min(1).max(10),
    comment: z.string(),
  })),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
})

// Analyze transcript using AI
export async function analyzeTranscript(params: {
  transcriptId: string
  interviewQuestions?: string[]
}) {
  try {
    // Get the transcript from Firestore
    const transcriptDoc = await adminDb.collection('transcripts').doc(params.transcriptId).get()
    
    if (!transcriptDoc.exists) {
      throw new Error('Transcript not found')
    }

    const transcriptData = transcriptDoc.data() as CallTranscript
    const fullTranscript = transcriptData.transcript.join('\n')

    // Generate AI feedback using Gemini
    const { object: feedback } = await generateObject({
      model: google('gemini-2.0-flash-001'),
      schema: feedbackSchema,
      prompt: `
        Analyze this Product Manager interview transcript and provide detailed feedback:

        Interview Questions Context:
        ${params.interviewQuestions?.join('\n') || 'Standard PM interview questions about product design and strategy'}

        Full Interview Transcript:
        ${fullTranscript}

        Please evaluate the candidate's performance across these categories:
        1. Communication Skills (clarity, articulation, listening) - Score 1-10
        2. Product Thinking (strategic approach, user focus, problem-solving) - Score 1-10  
        3. Leadership & Collaboration (team management, stakeholder communication) - Score 1-10
        4. Technical Understanding (system design, data analysis) - Score 1-10
        5. Business Acumen (market awareness, metrics, growth strategy) - Score 1-10

        Provide:
        - Individual scores (1-10) for each category with specific comments
        - Overall score (1-10) 
        - 3-5 key strengths demonstrated
        - 3-5 areas for improvement with actionable advice
        - A comprehensive final assessment (2-3 sentences)

        Focus on specific examples from their responses where possible.
      `
    })

    // Save feedback to Firestore
    await adminDb.collection('interview-feedback').add({
      transcriptId: params.transcriptId,
      userId: transcriptData.userId,
      interviewId: transcriptData.interviewId,
      feedback,
      analyzedAt: new Date().toISOString(),
    })

    return { 
      success: true, 
      feedback,
      message: 'Transcript analyzed successfully' 
    }
  } catch (error) {
    console.error('Error analyzing transcript:', error)
    throw new Error('Failed to analyze transcript')
  }
}
