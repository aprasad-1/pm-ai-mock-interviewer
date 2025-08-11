'use server'

import { adminDb } from '@/firebase/admin'

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

export async function getInterviews(userId: string) {
  try {
    // For now, let's return empty arrays to avoid Firestore index issues
    // In a real app, you would create the required indexes or simplify queries
    
    // Simplified query - fetch user's interviews without orderBy to avoid index requirement
    const userInterviewsQuery = adminDb
      .collection('interviews')
      .where('userId', '==', userId)
      .limit(10)

    // Simplified query - fetch all interviews and filter client-side for demo
    const allInterviewsQuery = adminDb
      .collection('interviews')
      .limit(20)

    // Execute both queries in parallel
    const [userInterviewsSnapshot, allInterviewsSnapshot] = await Promise.all([
      userInterviewsQuery.get(),
      allInterviewsQuery.get(),
    ])

    const userInterviews: Interview[] = []
    const otherInterviews: Interview[] = []

    userInterviewsSnapshot.forEach((doc) => {
      userInterviews.push({
        id: doc.id,
        ...doc.data(),
      } as Interview)
    })

    // Filter out user's interviews from all interviews to get "other" interviews
    allInterviewsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.userId !== userId) {
        otherInterviews.push({
          id: doc.id,
          ...data,
        } as Interview)
      }
    })

    return {
      userInterviews,
      otherInterviews,
    }
  } catch (error) {
    console.error('Error fetching interviews:', error)
    throw new Error('Failed to fetch interviews')
  }
}
