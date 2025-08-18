"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getVapi, getAssistantIdByCategory } from "@/lib/vapi.sdk";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { saveCallTranscript, createInterviewSession, updateInterviewSession, analyzeTranscript } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";
import { interviewer } from "@/constants";

// Define the structure for a single message in the conversation
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface AgentProps {
  userName: string;
  userID: string;
  type: string;
  assistantId?: string;
  interviewQuestions?: string[];
  questionSetId?: string;
  userPhotoURL?: string;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE   = "ACTIVE",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  FINISHED = "FINISHED",
}

const Agent = ({ userName, userID, assistantId, interviewQuestions = [], questionSetId, userPhotoURL }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [activeTranscript, setActiveTranscript] = useState<Message | null>(null);
  const [lastActiveTranscript, setLastActiveTranscript] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [callStartTime, setCallStartTime] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [initError, setInitError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  
  // Use ref to track current call status for timeouts
  const callStatusRef = useRef<CallStatus>(CallStatus.INACTIVE);
  
  // Helper function to update both state and ref
  const setCallStatusWithRef = useCallback((status: CallStatus) => {
    setCallStatus(status);
    callStatusRef.current = status;
  }, []);
  
  // Use useMemo to ensure VAPI instance is created only once
  const vapiInstance = useMemo(() => {
    if (hasAudioPermission === true) {
      const vapi = getVapi();
      if (vapi) {
        return vapi;
      } else {
        setInitError('VAPI initialization failed');
        return null;
      }
    }
    return null;
  }, [hasAudioPermission]);

  // Check if mobile and request audio permissions
  useEffect(() => {
    const checkMobileAndPermissions = async () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasAudioPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch {
        setHasAudioPermission(false);
      }
    };
    
    checkMobileAndPermissions();
  }, []);

  // Setup event listeners when VAPI instance is ready
  useEffect(() => {
    if (!vapiInstance) {
      return;
    }

    const handleCallStart = () => {
      setCallStatusWithRef(CallStatus.ACTIVE);
      setIsLoading(false);
      setIsEnding(false);
      setCallStartTime(new Date().toISOString());
      setConversation([]);
      setActiveTranscript(null);
      setLastActiveTranscript(null);
      setInitError(null);
    };

    const handleCallEnd = async () => {
      setCallStatusWithRef(CallStatus.FINISHED);
      setIsSpeaking(false);
      setIsLoading(false);
      setActiveTranscript(null);

      if (conversation.length > 0) {
        try {
          const callEndTime = new Date().toISOString();
          const duration = Math.floor((new Date(callEndTime).getTime() - new Date(callStartTime).getTime()) / 1000);
          
          const transcriptStrings = conversation.map(msg => 
            `${msg.role === 'assistant' ? 'Interviewer' : 'You'}: ${msg.content}`
          );
          
          const result = await saveCallTranscript({
            userId: userID,
            interviewId: null,
            transcript: transcriptStrings,
            callDuration: duration,
            callStartTime,
            callEndTime,
          });

          if (result.success) {
            router.push(`/feedback?transcriptId=${result.transcriptId}`);
          } else {
            router.push('/?error=transcript_save_failed');
          }
        } catch {
          router.push('/?error=transcript_save_failed');
        }
      } else {
        router.push('/');
      }
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleMessage = (message: unknown) => {
      if (message && typeof message === 'object' && 'type' in message && message.type === 'transcript' && 'transcript' in message && message.transcript) {
        const role: 'assistant' | 'user' = (message as Record<string, unknown>).role === 'assistant' ? 'assistant' : 'user';
        const transcriptText = String((message as Record<string, unknown>).transcript).trim();

        if ((message as Record<string, unknown>).transcriptType === 'partial') {
          const newTranscript: Message = { role, content: transcriptText, timestamp: Date.now() };
          setActiveTranscript(newTranscript);
          setLastActiveTranscript(newTranscript);
        } else if ((message as Record<string, unknown>).transcriptType === 'final') {
          setConversation((prev) => {
            const lastMessage = prev[prev.length - 1];
            
            if (lastMessage && 
                lastMessage.role === role && 
                Date.now() - (lastMessage.timestamp || 0) < 5000) {
              
              const lastText = lastMessage.content.trim();
              const newText = transcriptText;
              
              if (newText.length > lastText.length && newText.includes(lastText)) {
                return [
                  ...prev.slice(0, -1),
                  { role, content: newText, timestamp: Date.now() }
                ];
              }
              
              if (newText !== lastText && 
                  !newText.includes(lastText) && !lastText.includes(newText)) {
                
                const shouldCombine = role === 'user' ? 
                  (lastText.length < 200 || newText.length < 200) : 
                  (lastText.length < 100 || newText.length < 100);
                
                if (shouldCombine) {
                  return [
                    ...prev.slice(0, -1),
                    { role, content: `${lastText} ${newText}`, timestamp: Date.now() }
                  ];
                }
              }
              
              if (newText === lastText) {
                return prev;
              }
            }
            
            return [...prev, { role, content: transcriptText, timestamp: Date.now() }];
          });
          
          setTimeout(() => {
            setActiveTranscript(null);
          }, 500);
        }
      }
    };

    const handleError = (error: unknown) => {
      if (error && typeof error === 'object' && error !== null && 'preventDefault' in error) {
        const errorObj = error as { preventDefault: () => void };
        if (typeof errorObj.preventDefault === 'function') {
          errorObj.preventDefault();
        }
      }
      
      // Handle empty error objects (common VAPI issue)
      if (!error || (typeof error === 'object' && error !== null && Object.keys(error as Record<string, unknown>).length === 0)) {
        return;
      }

      const errorMessage = error && typeof error === 'object' && 'message' in error ? String((error as Record<string, unknown>).message) : '';
      const errorType = error && typeof error === 'object' && 'type' in error ? String((error as Record<string, unknown>).type) : '';
      const errorCode = error && typeof error === 'object' && 'code' in error ? Number((error as Record<string, unknown>).code) : 0;

      // Check for VAPI API errors
      if (errorCode && (errorCode >= 400 && errorCode < 500)) {
        if (errorCode === 400) {
          setInitError('VAPI configuration error - check assistant ID and settings');
        } else if (errorCode === 401) {
          setInitError('VAPI authentication failed - check your API key');
        } else if (errorCode === 403) {
          setInitError('VAPI access denied - check your account permissions');
        }
        
        setCallStatus(CallStatus.FINISHED);
        setIsLoading(false);
        setIsSpeaking(false);
        return;
      }

      // Non-critical errors that shouldn't end the call
      const nonCriticalErrors = [
        'krisp', 'noise', 'cancellation', 'timeout', 'network', 'connection'
      ];

      const isNonCritical = nonCriticalErrors.some(keyword => 
        errorMessage.toLowerCase().includes(keyword) ||
        errorType.toLowerCase().includes(keyword)
      );

      if (isNonCritical) {
        return;
      }

      // Critical errors that should end the call
      const criticalErrors = [
        'authentication', 'authorization', 'api_key', 'forbidden', 'invalid', 'failed to start'
      ];

      const isCritical = criticalErrors.some(keyword => 
        errorMessage.toLowerCase().includes(keyword) ||
        errorType.toLowerCase().includes(keyword)
      );

      if (isCritical) {
        setCallStatus(CallStatus.FINISHED);
        setIsLoading(false);
        setIsSpeaking(false);
        setInitError(`Critical error: ${errorMessage || errorType || 'Unknown error'}`);
        return;
      }

      // For unknown errors, only end call if we're in a connecting state
      if (callStatus === CallStatus.CONNECTING) {
        setCallStatus(CallStatus.FINISHED);
        setIsLoading(false);
        setIsSpeaking(false);
      }
    };

    // Add event listeners
    vapiInstance.on('call-start', handleCallStart);
    vapiInstance.on('call-end', handleCallEnd);
    vapiInstance.on('speech-start', handleSpeechStart);
    vapiInstance.on('speech-end', handleSpeechEnd);
    vapiInstance.on('message', handleMessage);
    vapiInstance.on('error', handleError);

    // Cleanup event listeners
    return () => {
      try {
        vapiInstance.off('call-start', handleCallStart);
        vapiInstance.off('call-end', handleCallEnd);
        vapiInstance.off('speech-start', handleSpeechStart);
        vapiInstance.off('speech-end', handleSpeechEnd);
        vapiInstance.off('message', handleMessage);
        vapiInstance.off('error', handleError);
      } catch (error) {
        console.warn('Error cleaning up VAPI listeners:', error);
      }
    };
  }, [vapiInstance, conversation, callStartTime, userID, router, callStatus, setCallStatusWithRef]);

  // Start call function
  const startCall = useCallback(async () => {
    if (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING) {
      return;
    }

    if (!vapiInstance) {
      setInitError('VAPI instance not available - initialization may have failed');
      return;
    }

    if (initError) {
      return;
    }
    
    try {
      await vapiInstance.stop();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      // Ignore errors when stopping non-existent calls
    }

    try {
      setCallStatusWithRef(CallStatus.CONNECTING);
      setIsLoading(true);
      
      const sessionResult = await createInterviewSession({
        userId: userID,
        interviewId: assistantId,
        interviewTitle: assistantId ? 'AI Product Manager Interview' : 'Product Design Questions'
      });
      
      if (sessionResult.success && sessionResult.sessionId) {
        setSessionId(sessionResult.sessionId);
      }
      
      let targetAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      
      if (questionSetId) {
        const categoryAssistantId = getAssistantIdByCategory(questionSetId);
        if (categoryAssistantId) {
          targetAssistantId = categoryAssistantId;
        }
      }
      
      if (targetAssistantId) {
        try {
          await vapiInstance.start(targetAssistantId);
        } catch {
          // Continue to monitor for call-start event
        }
      } else {
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
        
        try {
          await vapiInstance.start(interviewerConfig);
        } catch {
          // Continue to monitor for call-start event
        }
      }
      
      // Fallback: if call-start event doesn't fire within 8 seconds, assume it's active
      const connectionTimeout = setTimeout(() => {
        if (callStatusRef.current === CallStatus.CONNECTING) {
          setCallStatusWithRef(CallStatus.ACTIVE);
          setIsLoading(false);
        }
      }, 8000);
      
      // Cleanup timeout if call starts successfully
      const cleanupTimeout = () => {
        clearTimeout(connectionTimeout);
      };
      
      if (vapiInstance) {
        vapiInstance.once('call-start', cleanupTimeout);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCallStatus(CallStatus.FINISHED);
      setIsLoading(false);
      setInitError(`Call start failed: ${errorMessage}`);
    }
  }, [callStatus, assistantId, interviewQuestions, vapiInstance, initError, questionSetId, userID, setCallStatusWithRef]);

  // Manual end call and navigation function
  const handleManualEndCall = useCallback(async () => {
    setCallStatus(CallStatus.FINISHED);
    setIsSpeaking(false);
    setIsLoading(false);
    setIsEnding(true);
    setActiveTranscript(null);

    if (conversation.length > 0) {
      try {
        const callEndTime = new Date().toISOString();
        const duration = Math.floor((new Date(callEndTime).getTime() - new Date(callStartTime).getTime()) / 1000);
        
        const transcriptStrings = conversation.map(msg => 
          `${msg.role === 'assistant' ? 'Interviewer' : 'You'}: ${msg.content}`
        );
        
        const result = await saveCallTranscript({
          userId: userID,
          interviewId: null,
          transcript: transcriptStrings,
          callDuration: duration,
          callStartTime,
          callEndTime,
        });

        if (sessionId) {
          await updateInterviewSession({
            sessionId,
            endTime: callEndTime,
            duration,
            status: 'completed',
            transcriptId: result.success ? result.transcriptId : undefined
          });
        }

        if (result.success && result.transcriptId) {
          try {
            const analysisResult = await analyzeTranscript({
              transcriptId: result.transcriptId,
              interviewQuestions
            });

            if (analysisResult.success && analysisResult.feedback && sessionId) {
              await updateInterviewSession({
                sessionId,
                score: analysisResult.feedback.totalScore,
                feedbackId: result.transcriptId
              });
            }
          } catch (analysisError) {
            console.error('Analysis failed:', analysisError);
          }

          router.push(`/feedback?transcriptId=${result.transcriptId}`);
        } else {
          setIsEnding(false);
          router.push('/?error=transcript_save_failed');
        }
      } catch {
        setIsEnding(false);
        router.push('/?error=transcript_save_failed');
      }
    } else {
      setIsEnding(false);
      router.push('/');
    }
  }, [conversation, callStartTime, userID, router, sessionId, interviewQuestions]);

  // End call function
  const endCall = useCallback(async () => {
    if (!vapiInstance || typeof vapiInstance.stop !== 'function') {
      await handleManualEndCall();
      return;
    }
    
    try {
      await vapiInstance.stop();
      await handleManualEndCall();
    } catch {
      await handleManualEndCall();
    }
  }, [handleManualEndCall, vapiInstance]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (callStatus === CallStatus.ACTIVE && vapiInstance && typeof vapiInstance.stop === 'function') {
        try {
          vapiInstance.stop();
        } catch {
          console.warn('Error stopping VAPI on cleanup');
        }
      }
    };
  }, [callStatus, vapiInstance]);

  // UI Components for displaying transcripts
  const LiveTranscript = ({ transcript }: { transcript: Message | null }) => {
    const displayTranscript = transcript || lastActiveTranscript;
    
    if (!displayTranscript) return null;

    return (
      <div className="transcript-border">
        <div className="transcript">
          <span className={`font-bold ${displayTranscript.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
            {displayTranscript.role === 'user' ? 'You: ' : 'Interviewer: '}
          </span>
          <span className={`text-light-100 transition-opacity duration-300 ${transcript ? 'opacity-100' : 'opacity-70'}`}>
            {displayTranscript.content}
          </span>
        </div>
      </div>
    );
  };

  const ConversationLog = ({ conversation }: { conversation: Message[] }) => {
    return (
      <div className="card-border mt-8">
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Interview Transcript</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((msg, index) => (
              <div key={index} className="text-light-100">
                <span className={`font-bold ${msg.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                  {msg.role === 'user' ? 'You: ' : 'Interviewer: '}
                </span>
                <span className="text-light-100">{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Show audio permission error on mobile
  if (hasAudioPermission === false) {
    return (
      <div className="text-center py-8 sm:py-16 px-4">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
          <h3 className="text-orange-400 font-semibold mb-2">Microphone Permission Required</h3>
          <p className="text-light-100 text-sm mb-4">
            This app needs microphone access to conduct voice interviews.
          </p>
          <div className="text-left text-xs text-light-400 space-y-1">
            <p>• Click the microphone icon in your browser&apos;s address bar</p>
            <p>• Select &quot;Allow&quot; for microphone access</p>
            <p>• Refresh the page after granting permission</p>
            {isMobile && (
              <p className="text-orange-400 mt-2">• On mobile: Check browser settings if permission is blocked</p>
            )}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4 w-full sm:w-auto min-h-[44px]"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show error state if VAPI initialization failed
  if (initError && !vapiInstance) {
    return (
      <div className="text-center py-8 sm:py-16 px-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">VAPI Initialization Error</h3>
          <p className="text-light-100 text-sm mb-4">
            {initError}
          </p>
          <div className="text-left text-xs text-light-400 space-y-1">
            <p>• Check NEXT_PUBLIC_VAPI_API_KEY in .env.local</p>
            <p>• Ensure your VAPI API key is valid</p>
            <p>• Try refreshing the page</p>
            {isMobile && (
              <p className="text-orange-400 mt-2">• On mobile: Ensure stable internet connection</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while VAPI is initializing
  if ((!vapiInstance && !initError) || hasAudioPermission === null) {
    return (
      <div className="text-center py-8 sm:py-16 px-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-200 mx-auto mb-4"></div>
        <p className="text-light-100 text-sm sm:text-base">
          {hasAudioPermission === null ? 'Checking audio permissions...' : 'Initializing VAPI...'}
        </p>
        {isMobile && (
          <p className="text-light-400 text-xs mt-2">On mobile, please allow microphone access when prompted</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isEnding && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-200 mx-auto mb-4"></div>
            <p className="text-white font-medium">Processing interview...</p>
            <p className="text-light-400 text-sm mt-1">Please wait while we prepare your feedback</p>
          </div>
        </div>
      )}

      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <div className="w-16 h-16 bg-primary-200/10 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary-200" />
            </div>
            {isSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-interviewer">
          <div className="avatar">
            {userPhotoURL ? (
              <Image 
                src={userPhotoURL} 
                alt="user avatar" 
                width={64} 
                height={64} 
                className="rounded-full object-cover" 
              />
            ) : (
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-400" />
              </div>
            )}
          </div>
          <h3>{userName}</h3>
        </div>
      </div>

      {/* Conditional Transcript Display */}
      {callStatus === CallStatus.ACTIVE && (
        <LiveTranscript transcript={activeTranscript} />
      )}

      {callStatus === CallStatus.FINISHED && conversation.length > 0 && (
        <ConversationLog conversation={conversation} />
      )}

      <div className="w-full flex justify-center mt-6 sm:mt-8 px-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-colors min-h-[44px] w-full sm:w-auto max-w-xs" 
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
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed min-h-[44px] w-full sm:w-auto"
              disabled
            >
              Connected
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] w-full sm:w-auto"
              onClick={endCall}
              disabled={isEnding}
            >
              {isEnding ? 'Ending...' : 'End Interview'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent;
