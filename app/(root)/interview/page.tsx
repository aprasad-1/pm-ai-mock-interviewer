import React from "react";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface InterviewPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const InterviewPage = async ({ searchParams }: InterviewPageProps) => {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-light-100">Please sign in to start an interview.</p>
        </div>
      </div>
    );
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Product Manager Interview
          </h1>
          <p className="text-light-100">
            Practice your product design skills with our AI interviewer. 
            Click "Start Interview" when you're ready to begin.
          </p>
        </div>
        
        <Agent 
          userName={user.name || "Candidate"} 
          userID={user.uid} 
          type={interviewType}
          assistantId={assistantId}
          interviewQuestions={productDesignQuestions}
        />
      </div>
    </div>
  );
};

export default InterviewPage;
