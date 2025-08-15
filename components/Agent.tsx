"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

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
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const lastMessage = messages[messages.length - 1];

  // Initialize Vapi event listeners
  useEffect(() => {
    const handleCallStart = () => {
      setCallStatus(CallStatus.CONNECTING);
      setIsLoading(true);
    };

    const handleCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
      setIsLoading(false);
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcript) {
        setMessages(prev => [...prev, message.transcript]);
      }
    };

    const handleError = (error: any) => {
      console.error('Vapi error:', error);
      setCallStatus(CallStatus.FINISHED);
      setIsLoading(false);
      setIsSpeaking(false);
    };

    // Add event listeners
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);

    // Cleanup event listeners
    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('message', handleMessage);
      vapi.off('error', handleError);
    };
  }, []);

  // Start call function
  const startCall = useCallback(async () => {
    if (callStatus === CallStatus.ACTIVE) return;

    try {
      setCallStatus(CallStatus.CONNECTING);
      setIsLoading(true);
      
      // Use assistantId if provided, otherwise create inline assistant
      if (assistantId) {
        await vapi.start(assistantId);
      } else {
        // Create inline assistant configuration
        const assistantConfig: CreateAssistantDTO = {
          name: "Interview Assistant",
          firstMessage: "Hello! I'm your AI interviewer. Let's begin with your interview. Are you ready?",
          model: {
            provider: "openai",
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are a professional interviewer. Ask these questions one by one: ${interviewQuestions.join(', ')}. Keep responses natural and conversational.`
              }
            ]
          },
          voice: {
            provider: "11labs",
            voiceId: "sarah"
          },
          transcriber: {
            provider: "deepgram" as const,
            model: "nova-2" as const,
            language: "en" as const
          }
        };
        
        await vapi.start(assistantConfig);
      }
      setCallStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus(CallStatus.FINISHED);
      setIsLoading(false);
    }
  }, [callStatus, assistantId, interviewQuestions]);

  // End call function
  const endCall = useCallback(async () => {
    try {
      await vapi.stop();
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }, []);

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
      <div className="card-border">
        <div className="card-border-content">
          <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover" />
          <h3>{userName}</h3>
        </div>
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

    <div className="w-full flex justify-center">
      {callStatus !== CallStatus.ACTIVE ? (
        <button 
          className="relative btn-call" 
          onClick={startCall}
          disabled={isLoading || callStatus === CallStatus.CONNECTING}
        >
          <span className={cn(
            'absolute animate-ping rounded-full', 
            callStatus !== CallStatus.CONNECTING && "hidden"
          )}/>

          <span>
            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED 
              ? 'Start Interview' 
              : 'Connecting...'}  
          </span>
        </button>
      ) : (
        <button 
          className="btn-disconnect"
          onClick={endCall}
        >
          End Interview
        </button>
      )}
    </div>
    </>
   
  );
};

export default Agent;
