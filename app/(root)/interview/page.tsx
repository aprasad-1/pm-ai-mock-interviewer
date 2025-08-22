import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserProfile } from "@/lib/actions/user.action";
import { getQuestionSet, getRandomQuestion, getAssistantId } from "@/lib/interview-templates";
import SimpleInterviewContainer from "@/components/SimpleInterviewContainer";

interface InterviewPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const InterviewPage = async ({ searchParams }: InterviewPageProps) => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get user profile for wallet information
  let userProfile;
  try {
    userProfile = await getUserProfile();
  } catch (error) {
    // If we can't get profile, continue with basic user info
    userProfile = null;
  }

  // Check if user has enough minutes for the interview
  const requiredMinutes = 30;
  const hasEnoughMinutes = userProfile ? userProfile.walletMinutes >= requiredMinutes : false;

  // Get interview parameters from URL
  const resolvedSearchParams = await searchParams;
  const categoryId = (resolvedSearchParams.categoryId as string) || 'product-design';
  const interviewType = (resolvedSearchParams.type as string) || "product-management";
  const interviewTitle = (resolvedSearchParams.title as string) || "Product Manager Interview";
  
  // Get the question set and random question
  const questionSet = getQuestionSet(categoryId);
  const assistantId = questionSet ? getAssistantId(questionSet.assistantTemplate) : undefined;
  const randomQuestion = getRandomQuestion(categoryId);
  
  // Fallback questions if category not found
  const fallbackQuestions = [
    "How would you design a product for elderly users?",
    "Walk me through how you would improve the user experience of a mobile banking app.",
    "How would you prioritize features for a new social media platform?"
  ];
  
  const interviewQuestions = randomQuestion ? [randomQuestion] : fallbackQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 to-dark-300">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-200/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center leading-tight">
                {interviewTitle}
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-base sm:text-lg text-light-100 px-4">
                {questionSet ? questionSet.description : 'Practice your product management skills with our AI interviewer'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-dark-200/50 rounded-full border border-primary-200/20">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs sm:text-sm text-light-200">AI-Powered Interview Experience</span>
              </div>
              

            </div>
          </div>

         
          {/* Simple Interview Container */}
          <SimpleInterviewContainer
            userName={user.name || "Candidate"}
            userID={user.uid}
            type={interviewType}
            assistantId={assistantId}
            interviewQuestions={interviewQuestions}
            questionSetId={categoryId}
            userPhotoURL={user.photoURL}
            hasEnoughMinutes={hasEnoughMinutes}
            walletMinutes={userProfile?.walletMinutes || 0}
            subscriptionStatus={userProfile?.subscriptionStatus || 'free'}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
