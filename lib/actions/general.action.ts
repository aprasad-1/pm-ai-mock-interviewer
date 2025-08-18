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

export interface InterviewSession {
  id: string
  userId: string
  interviewId?: string
  interviewTitle: string
  startTime: string
  endTime?: string
  duration: number // in seconds
  score?: number // 1-10
  status: 'completed' | 'in_progress' | 'cancelled'
  transcriptId?: string
  feedbackId?: string
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
    // First try to get from webhook transcripts (call-transcripts collection)
    let transcriptDoc = await adminDb.collection('call-transcripts').doc(transcriptId).get()
    
    if (transcriptDoc.exists) {
      console.log('📄 Found webhook transcript:', transcriptId)
      const transcriptData = transcriptDoc.data()
      
      // Convert webhook format to expected format
      return {
        success: true,
        transcript: {
          id: transcriptDoc.id,
          userId: transcriptData?.userId || 'unknown', // Webhook transcripts might not have userId
          transcript: transcriptData?.transcript || [],
          callDuration: transcriptData?.callDuration || 0,
          callStartTime: transcriptData?.createdAt || new Date().toISOString(),
          callEndTime: transcriptData?.callEndTime || new Date().toISOString(),
          createdAt: transcriptData?.createdAt || new Date().toISOString()
        } as CallTranscript
      }
    }
    
    // Fallback to client transcripts (transcripts collection)
    transcriptDoc = await adminDb.collection('transcripts').doc(transcriptId).get()

    if (!transcriptDoc.exists) {
      throw new Error('Transcript not found')
    }

    console.log('📄 Found client transcript:', transcriptId)
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

// Interview Session Management
export async function createInterviewSession(params: {
  userId: string
  interviewId?: string
  interviewTitle: string
}) {
  try {
    const sessionData: Omit<InterviewSession, 'id'> = {
      userId: params.userId,
      interviewId: params.interviewId,
      interviewTitle: params.interviewTitle,
      startTime: new Date().toISOString(),
      duration: 0,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('interview-sessions').add(sessionData)
    
    return { 
      success: true, 
      sessionId: docRef.id,
      message: 'Interview session created successfully' 
    }
  } catch (error) {
    console.error('Error creating interview session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create interview session'
    }
  }
}

export async function updateInterviewSession(params: {
  sessionId: string
  endTime?: string
  duration?: number
  score?: number
  status?: 'completed' | 'cancelled'
  transcriptId?: string
  feedbackId?: string
}) {
  try {
    const updateData: Partial<InterviewSession> = {
      ...params,
      updatedAt: new Date().toISOString(),
    }

    // Remove sessionId from update data
    delete (updateData as any).sessionId

    await adminDb.collection('interview-sessions').doc(params.sessionId).update(updateData)
    
    return { 
      success: true, 
      message: 'Interview session updated successfully' 
    }
  } catch (error) {
    console.error('Error updating interview session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to update interview session'
    }
  }
}

export async function getUserInterviewSessions(userId: string) {
  try {
    console.log('🔍 Fetching sessions for user:', userId);
    
    // Simplified query without orderBy to avoid index issues
    const sessionsQuery = adminDb
      .collection('interview-sessions')
      .where('userId', '==', userId)
      .limit(20)

    const sessionsSnapshot = await sessionsQuery.get()
    const sessions: InterviewSession[] = []

    sessionsSnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      } as InterviewSession)
    })

    // Sort client-side to avoid Firestore index requirements
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log('✅ Found sessions:', {
      count: sessions.length,
      sessions: sessions.map(s => ({ id: s.id, title: s.interviewTitle, status: s.status }))
    });

    return {
      success: true,
      sessions
    }
  } catch (error) {
    console.error('Error fetching interview sessions:', error)
    // Return empty array instead of throwing to prevent crashes
    return {
      success: false,
      sessions: [] as InterviewSession[],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getInterviewFeedback(feedbackId: string) {
  try {
    const feedbackDoc = await adminDb.collection('interview-feedback').doc(feedbackId).get()
    
    if (!feedbackDoc.exists) {
      return { success: false, error: 'Feedback not found' }
    }

    const feedbackData = feedbackDoc.data()
    
    return { 
      success: true, 
      feedback: feedbackData?.feedback as InterviewFeedback
    }
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getUserInterviewSessionsWithFeedback(userId: string) {
  try {
    const { sessions } = await getUserInterviewSessions(userId)
    
    // If no sessions exist, create a sample one for demonstration
    if (sessions.length === 0) {
      console.log('🎯 No sessions found, creating sample session...');
      await createSampleInterviewSession(userId);
      // Fetch again after creating sample
      const { sessions: newSessions } = await getUserInterviewSessions(userId)
      
      const sessionsWithFeedback = newSessions.map(session => ({
        session,
        feedback: null
      }))
      
      return {
        success: true,
        sessionsWithFeedback
      }
    }
    
    // Get feedback for sessions that have feedback IDs
    const sessionsWithFeedback = await Promise.all(
      sessions.map(async (session) => {
        if (session.feedbackId) {
          const { feedback } = await getInterviewFeedback(session.feedbackId)
          return { session, feedback }
        }
        return { session, feedback: null }
      })
    )

    return {
      success: true,
      sessionsWithFeedback
    }
  } catch (error) {
    console.error('Error fetching sessions with feedback:', error)
    return {
      success: false,
      sessionsWithFeedback: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to create a sample interview session for testing
export async function getUserInterviewFeedbacks(userId: string) {
  try {
    console.log('🔍 Fetching feedback for user:', userId);
    
    const feedbackQuery = adminDb
      .collection('interview-feedback')
      .where('userId', '==', userId)
      .limit(20)

    const feedbackSnapshot = await feedbackQuery.get()
    const feedbacks: Array<{
      id: string
      userId: string
      transcriptId: string
      interviewId?: string
      feedback: InterviewFeedback
      analyzedAt: string
    }> = []

    feedbackSnapshot.forEach((doc) => {
      feedbacks.push({
        id: doc.id,
        ...doc.data(),
      } as any)
    })

    // If no feedbacks exist, create a sample one for demonstration
    if (feedbacks.length === 0) {
      console.log('🎯 No feedbacks found, creating sample feedback...');
      await createSampleInterviewFeedback(userId);
      // Fetch again after creating sample
      const newFeedbackSnapshot = await feedbackQuery.get()
      newFeedbackSnapshot.forEach((doc) => {
        feedbacks.push({
          id: doc.id,
          ...doc.data(),
        } as any)
      })
    }

    // Sort client-side by analyzedAt (newest first)
    feedbacks.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())

    console.log('✅ Found feedbacks:', {
      count: feedbacks.length,
      feedbacks: feedbacks.map(f => ({ 
        id: f.id, 
        score: f.feedback.totalScore, 
        analyzedAt: f.analyzedAt 
      }))
    });

    return {
      success: true,
      feedbacks
    }
  } catch (error) {
    console.error('Error fetching interview feedbacks:', error)
    return {
      success: false,
      feedbacks: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to create sample feedback for testing
export async function createSampleInterviewFeedback(userId: string) {
  try {
    const sampleFeedback: InterviewFeedback = {
      totalScore: 8,
      categoryScores: [
        {
          name: "Communication Skills",
          score: 9,
          comment: "Excellent articulation and clear explanation of complex concepts. Demonstrated strong listening skills and asked thoughtful follow-up questions."
        },
        {
          name: "Product Thinking",
          score: 8,
          comment: "Strong user-centric approach with good understanding of product strategy. Could improve on competitive analysis depth."
        },
        {
          name: "Leadership & Collaboration",
          score: 7,
          comment: "Good examples of team leadership and stakeholder management. Would benefit from more specific metrics on team performance."
        },
        {
          name: "Technical Understanding",
          score: 8,
          comment: "Solid grasp of technical concepts and system design principles. Effectively communicated technical trade-offs to non-technical stakeholders."
        },
        {
          name: "Business Acumen",
          score: 8,
          comment: "Strong understanding of market dynamics and business metrics. Demonstrated good analytical thinking for ROI calculations."
        }
      ],
      strengths: [
        "Excellent communication skills with clear and concise explanations",
        "Strong user empathy and customer-centric thinking",
        "Good analytical approach to problem-solving",
        "Effective use of data to support decisions",
        "Strong understanding of product lifecycle management"
      ],
      areasForImprovement: [
        "Could provide more specific examples of handling difficult stakeholders",
        "Would benefit from deeper competitive analysis skills",
        "Could improve on technical architecture discussions",
        "More focus on international market considerations needed"
      ],
      finalAssessment: "Strong candidate with excellent communication skills and solid product thinking. Demonstrates good leadership potential and technical understanding. With some additional experience in competitive analysis and stakeholder management, would be well-suited for senior PM roles."
    }

    const feedbackDoc = {
      transcriptId: 'sample-transcript-id',
      userId,
      interviewId: null,
      feedback: sampleFeedback,
      analyzedAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('interview-feedback').add(feedbackDoc)
    console.log('✅ Sample feedback created:', docRef.id);
    
    return { success: true, feedbackId: docRef.id }
  } catch (error) {
    console.error('Error creating sample feedback:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper function to create a sample interview session for testing
export async function createSampleInterviewSession(userId: string) {
  try {
    const sampleSession: Omit<InterviewSession, 'id'> = {
      userId,
      interviewTitle: 'Product Manager Interview - Sample',
      startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
      endTime: new Date().toISOString(),
      duration: 1500, // 25 minutes in seconds
      score: 8, // Sample score
      status: 'completed',
      transcriptId: 'sample-transcript',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('interview-sessions').add(sampleSession)
    console.log('✅ Sample session created:', docRef.id);
    
    return { success: true, sessionId: docRef.id }
  } catch (error) {
    console.error('Error creating sample session:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
