import React from "react";
import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface InterviewPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const InterviewPage = async ({ searchParams }: InterviewPageProps) => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get interview parameters from URL or use defaults
  const interviewType = (searchParams.type as string) || "product-design";
  const assistantId = searchParams.assistantId as string;
  
  // Product design interview questions (these won't be used if assistantId is provided)
  const productDesignQuestions = [
    "How would you design a product for elderly users?",
    "Walk me through how you would improve the user experience of a mobile banking app.",
    "How would you prioritize features for a new social media platform?",
    "Describe your process for conducting user research.",
    "How would you design a product that serves both B2B and B2C markets?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 to-dark-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-200/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white">
                Product Manager Interview
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-lg text-light-100">
                Practice your product design skills with our AI interviewer
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-200/50 rounded-full border border-primary-200/20">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-light-200">AI-Powered Interview Experience</span>
            </div>
          </div>

         
          {/* Interview Agent */}
          <Agent 
            userName={user.name || "Candidate"} 
            userID={user.uid} 
            type={interviewType}
            assistantId={assistantId}
            interviewQuestions={productDesignQuestions}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
