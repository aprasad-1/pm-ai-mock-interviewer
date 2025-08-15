import React from "react";
import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface InterviewPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const InterviewPage = async ({ searchParams }: InterviewPageProps) => {
  // Authentication check with proper error handling
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Authentication error:', error);
    redirect('/sign-in?error=auth_failed');
  }

  if (!user) {
    redirect('/sign-in?error=unauthorized&message=Please sign in to start an interview');
  }

  // Get interview parameters from URL with validation
  const resolvedSearchParams = await searchParams;
  const interviewType = (resolvedSearchParams.type as string) || "product-design";
  const interviewId = resolvedSearchParams.interviewId as string;
  const role = (resolvedSearchParams.role as string) || "Product Manager Interview";
  const assistantId = resolvedSearchParams.assistantId as string;
  const isResume = resolvedSearchParams.resume === 'true';
  
  // Product design interview questions
  const productDesignQuestions = [
    "How would you design a product for elderly users?",
    "Walk me through how you would improve the user experience of a mobile banking app.",
    "How would you prioritize features for a new social media platform?",
    "Describe your process for conducting user research.",
    "How would you design a product that serves both B2B and B2C markets?"
  ];

  // Technical interview questions
  const technicalQuestions = [
    "Explain the difference between SQL and NoSQL databases.",
    "How would you design a scalable system for a messaging app?",
    "What are the key principles of RESTful API design?",
    "How would you optimize the performance of a slow web application?",
    "Explain the concept of microservices architecture."
  ];

  // Select questions based on interview type
  const getInterviewQuestions = (type: string) => {
    switch (type) {
      case 'product-design':
        return productDesignQuestions;
      case 'technical':
        return technicalQuestions;
      default:
        return productDesignQuestions;
    }
  };

  const questions = getInterviewQuestions(interviewType);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {role}
          </h1>
          <p className="text-light-100">
            {isResume 
              ? 'Welcome back! Continue your interview session.'
              : `Practice your ${interviewType.replace('-', ' ')} skills with our AI interviewer. Click "Start Interview" when you're ready to begin.`
            }
          </p>
          {interviewId && (
            <div className="mt-2 text-sm text-light-400">
              Interview ID: {interviewId}
            </div>
          )}
        </div>
        
        <Agent 
          userName={user.name || "Candidate"} 
          userID={user.uid} 
          type={interviewType}
          assistantId={assistantId}
          interviewQuestions={questions}
        />
      </div>
    </div>
  );
};

export default InterviewPage;
