"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { saveCallTranscript, createInterviewSession, updateInterviewSession, analyzeTranscript } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { interviewer } from "@/constants";

interface AgentProps {
  userName: string;
  userID: string;
  type: string;
  assistantId?: string;
  interviewQuestions?: string[];
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE   = "ACTIVE",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  FINISHED = "FINISHED",
}

const Agent = ({ userName, userID, assistantId, interviewQuestions = [] }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [fullTranscript, setFullTranscript] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callStartTime, setCallStartTime] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const lastMessage = messages[messages.length - 1];

  // Initialize Vapi event listeners
  useEffect(() => {
    if (!vapi) {
      console.error('❌ VAPI not initialized - check NEXT_PUBLIC_VAPI_API_KEY environment variable');
      console.error('Environment check:', {
        hasApiKey: !!process.env.NEXT_PUBLIC_VAPI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      });
      return;
    }

    console.log('✅ VAPI initialized successfully');

    const handleCallStart = () => {
      console.log('✅ VAPI call started successfully');
      setCallStatus(CallStatus.ACTIVE); // Changed from CONNECTED to ACTIVE
      setIsLoading(false);
      setCallStartTime(new Date().toISOString());
      setFullTranscript([]);
    };

    const handleCallEnd = async () => {
      console.log('🏁 Call ended, processing transcript...');
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
      setIsLoading(false);

      console.log('📝 Transcript data:', {
        transcriptLength: fullTranscript.length,
        callStartTime,
        userId: userID
      });

      // Save transcript and navigate to feedback page
      if (fullTranscript.length > 0) {
        try {
          console.log('💾 Saving transcript to Firestore...');
          const callEndTime = new Date().toISOString();
          const duration = Math.floor((new Date(callEndTime).getTime() - new Date(callStartTime).getTime()) / 1000);
          
          const result = await saveCallTranscript({
            userId: userID,
            interviewId: null, // Explicitly set to null instead of undefined
            transcript: fullTranscript,
            callDuration: duration,
            callStartTime,
            callEndTime,
          });

          console.log('📄 Save result:', result);

          if (result.success) {
            console.log('🚀 Navigating to feedback page...');
            // Navigate to feedback page with transcript ID
            router.push(`/feedback?transcriptId=${result.transcriptId}`);
          } else {
            console.error('❌ Failed to save transcript:', result.error || result.message);
            router.push('/?error=transcript_save_failed');
          }
        } catch (error) {
          console.error('❌ Failed to save transcript:', error);
          // Navigate to home with error
          router.push('/?error=transcript_save_failed');
        }
      } else {
        console.log('⚠️ No transcript to save, navigating to home');
        // If no transcript, just go back to home
        router.push('/');
      }
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      console.log('📨 VAPI message received:', { type: message.type, hasTranscript: !!message.transcript });
      
      if (message.type === 'transcript' && message.transcript) {
        console.log('📝 Adding transcript:', message.transcript);
        setMessages(prev => [...prev, message.transcript]);
        setFullTranscript(prev => {
          const updated = [...prev, message.transcript];
          console.log('📚 Full transcript now has', updated.length, 'messages');
          return updated;
        });
      }
    };

    const handleError = (error: any) => {
      console.error('Vapi error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        stack: error.stack
      });
      
      // Don't end call for Krisp-related errors (they're not critical)
      if (error.message && error.message.includes('Krisp')) {
        console.warn('⚠️ Krisp noise cancellation error (non-critical), continuing call...');
        return;
      }
      
      // Only end call for critical errors
      setCallStatus(CallStatus.FINISHED);
      setIsLoading(false);
      setIsSpeaking(false);
    };

    // Add event listeners (vapi is guaranteed to exist here due to check above)
    vapi!.on('call-start', handleCallStart);
    vapi!.on('call-end', handleCallEnd);
    vapi!.on('speech-start', handleSpeechStart);
    vapi!.on('speech-end', handleSpeechEnd);
    vapi!.on('message', handleMessage);
    vapi!.on('error', handleError);

    // Cleanup event listeners
    return () => {
      vapi!.off('call-start', handleCallStart);
      vapi!.off('call-end', handleCallEnd);
      vapi!.off('speech-start', handleSpeechStart);
      vapi!.off('speech-end', handleSpeechEnd);
      vapi!.off('message', handleMessage);
      vapi!.off('error', handleError);
    };
  }, []);

  // Start call function
  const startCall = useCallback(async () => {
    console.log('🚀 StartCall triggered', { callStatus, vapi: !!vapi });
    
    if (callStatus === CallStatus.ACTIVE || !vapi) {
      console.log('❌ StartCall blocked:', { callStatus, vapiExists: !!vapi });
      return;
    }

    try {
      console.log('🔄 Starting VAPI call...');
      setCallStatus(CallStatus.CONNECTING);
      setIsLoading(true);
      
      // Create interview session
      const sessionResult = await createInterviewSession({
        userId: userID,
        interviewId: assistantId,
        interviewTitle: assistantId ? 'AI Product Manager Interview' : 'Product Design Questions'
      });
      
      if (sessionResult.success && sessionResult.sessionId) {
        setSessionId(sessionResult.sessionId);
        console.log('✅ Interview session created:', sessionResult.sessionId);
      }
      
      // Use assistantId if provided, otherwise use the predefined interviewer configuration
      if (assistantId) {
        await vapi!.start(assistantId);
      } else {
        // Use the predefined interviewer configuration from constants
        const updatedContent = interviewer.model?.messages?.[0]?.content?.replace(
          '{{questions}}', 
          interviewQuestions.join('\n')
        ) || `You are a professional interviewer. Ask these questions: ${interviewQuestions.join(', ')}`;
        
        const interviewerConfig = {
          ...interviewer,
          model: {
            ...interviewer.model,
            messages: [
              {
                role: "system" as const,
                content: updatedContent
              }
            ]
          }
        } as CreateAssistantDTO;
        
        console.log('📋 Starting with config:', { 
          hasConfig: !!interviewerConfig, 
          questionsCount: interviewQuestions.length,
          apiKeyExists: !!process.env.NEXT_PUBLIC_VAPI_API_KEY
        });
        
        await vapi!.start(interviewerConfig);
      }
      
      console.log('🎯 VAPI start completed, waiting for call-start event...');
      
      // Fallback: if call-start event doesn't fire within 3 seconds, assume it's active
      setTimeout(() => {
        if (callStatus === CallStatus.CONNECTING) {
          console.log('⏰ Call-start event timeout, setting status to ACTIVE');
          setCallStatus(CallStatus.ACTIVE);
          setIsLoading(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to start call:', error);
      console.error('Start call error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        vapiInitialized: !!vapi,
        hasApiKey: !!process.env.NEXT_PUBLIC_VAPI_API_KEY
      });
      setCallStatus(CallStatus.FINISHED);
      setIsLoading(false);
    }
  }, [callStatus, assistantId, interviewQuestions]);

  // Manual end call and navigation function
  const handleManualEndCall = useCallback(async () => {
    console.log('🛑 Manual end call triggered');
    
    // Set status to finished immediately
    setCallStatus(CallStatus.FINISHED);
    setIsSpeaking(false);
    setIsLoading(false);

    // Save transcript and navigate
    if (fullTranscript.length > 0) {
      try {
        console.log('💾 Saving transcript manually...');
        const callEndTime = new Date().toISOString();
        const duration = Math.floor((new Date(callEndTime).getTime() - new Date(callStartTime).getTime()) / 1000);
        
        const result = await saveCallTranscript({
          userId: userID,
          interviewId: null, // Explicitly set to null instead of undefined
          transcript: fullTranscript,
          callDuration: duration,
          callStartTime,
          callEndTime,
        });

        // Update interview session
        if (sessionId) {
          await updateInterviewSession({
            sessionId,
            endTime: callEndTime,
            duration,
            status: 'completed',
            transcriptId: result.success ? result.transcriptId : undefined
          });
          console.log('✅ Interview session updated');
        }

        console.log('📄 Manual save result:', result);

        if (result.success && result.transcriptId) {
          console.log('🤖 Starting AI analysis...');
          
          // Analyze transcript and generate feedback
          try {
            const analysisResult = await analyzeTranscript({
              transcriptId: result.transcriptId,
              interviewQuestions
            });

            if (analysisResult.success && analysisResult.feedback) {
              // Update session with score and feedback ID
              if (sessionId) {
                await updateInterviewSession({
                  sessionId,
                  score: analysisResult.feedback.totalScore,
                  feedbackId: result.transcriptId // Using transcriptId as feedbackId for now
                });
              }
              console.log('✅ Analysis completed with score:', analysisResult.feedback.totalScore);
            }
          } catch (analysisError) {
            console.error('❌ Analysis failed:', analysisError);
          }

          console.log('🚀 Manual navigation to feedback page...');
          router.push(`/feedback?transcriptId=${result.transcriptId}`);
        } else {
          console.error('❌ Save failed:', result.error || result.message);
          router.push('/?error=transcript_save_failed');
        }
      } catch (error) {
        console.error('❌ Manual save failed:', error);
        router.push('/?error=transcript_save_failed');
      }
    } else {
      console.log('⚠️ No transcript, going to home');
      router.push('/');
    }
  }, [fullTranscript, callStartTime, userID, router]);

  // End call function
  const endCall = useCallback(async () => {
    if (!vapi || typeof vapi.stop !== 'function') {
      console.error('VAPI not properly initialized');
      return;
    }
    
    try {
      console.log('🛑 Stopping VAPI call...');
      await vapi.stop();
      
      // Don't rely on the event - handle it manually
      await handleManualEndCall();
    } catch (error) {
      console.error('Failed to end call:', error);
      // Still try to handle the end call manually
      await handleManualEndCall();
    }
  }, [handleManualEndCall]);

  // Cleanup on component unmount - stop any active calls
  useEffect(() => {
    return () => {
      if (callStatus === CallStatus.ACTIVE && vapi && typeof vapi.stop === 'function') {
        try {
          vapi.stop();
        } catch (error) {
          console.error('Error stopping VAPI:', error);
        }
      }
    };
  }, [callStatus]);

  // Show error state if VAPI is not available
  if (!vapi) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">VAPI Not Available</h3>
          <p className="text-light-100 text-sm">
            Please check that your VAPI API key is properly configured in your environment variables.
          </p>
          <p className="text-light-400 text-xs mt-2">
            Add NEXT_PUBLIC_VAPI_API_KEY to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="call-view">
      <div className="card-interviewer">
        <div className="avatar">
          <img src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover"/>
          {isSpeaking && <span className="animate-speak"></span>}
        </div>
        <h3>AI Interviewer</h3>
      </div>
      <div className="card-interviewer">
        <div className="avatar">
          <Image src="/user-avatar.png" alt="user avatar" width={65} height={54} className="rounded-full object-cover" />
        </div>
        <h3>{userName}</h3>
      </div>
    </div>

    {messages.length > 0 && (
      <div className="transcript-border">
        <div className="transcript">
          <p key = {lastMessage} className = {cn("transition-opacity duration-500 opacity-0", "animate-fade-in opacity-100")}>
            {lastMessage}</p>
        </div>
      </div>
    )}

    <div className="w-full flex justify-center gap-4">
      {callStatus !== CallStatus.ACTIVE ? (
        <>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors" 
            onClick={startCall}
            disabled={isLoading || callStatus === CallStatus.CONNECTING}
          >
            <span className={cn(
              'absolute animate-ping rounded-full', 
              callStatus !== CallStatus.CONNECTING && "hidden"
            )}/>
            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED 
              ? 'Start Interview' 
              : 'Connecting...'}
          </Button>
          
          {/* Temporary test button for development */}
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-sm" 
            onClick={async () => {
              console.log('🧪 Testing feedback flow...');
              // Create mock transcript for testing
              const mockTranscript = [
                "Hello! Thank you for taking the time to speak with me today.",
                "Hi, thank you for having me. I'm excited about this opportunity.",
                "Great! Let's start with the first question. How would you design a product for elderly users?",
                "That's a great question. I would focus on accessibility and simplicity..."
              ];
              
              const result = await saveCallTranscript({
                userId: userID,
                interviewId: null, // Explicitly set to null instead of undefined
                transcript: mockTranscript,
                callDuration: 120,
                callStartTime: new Date(Date.now() - 120000).toISOString(),
                callEndTime: new Date().toISOString(),
              });
              
              if (result.success) {
                router.push(`/feedback?transcriptId=${result.transcriptId}`);
              }
            }}
          >
            Test Feedback
          </Button>
        </>
      ) : (
        <>
          <Button 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
            disabled
          >
            Connected
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            onClick={endCall}
          >
            <Square className="w-4 h-4" />
            End Interview
          </Button>
        </>
      )}
    </div>
    </>
   
  );
};

export default Agent;
