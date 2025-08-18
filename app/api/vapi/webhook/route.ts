import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';

/**
 * VAPI Webhook Handler for Accurate Speaker Attribution
 * 
 * Setup Instructions:
 * 1. Deploy this webhook endpoint to your production domain
 * 2. In VAPI dashboard, configure your assistant's server URL to:
 *    https://your-domain.com/api/vapi/webhook
 * 3. Set NEXT_PUBLIC_BASE_URL in your environment variables
 * 4. The webhook will handle transcript processing and speaker attribution automatically
 * 
 * This webhook processes:
 * - conversation-update: Full conversation history with proper speaker roles
 * - transcript: Real-time transcript events
 * - end-of-call-report: Final call completion with transcript saving
 */

// VAPI Webhook Event Types
interface VAPIWebhookEvent {
  type: 'conversation-update' | 'transcript' | 'status-update' | 'end-of-call-report' | 'speech-update';
  call: {
    id: string;
    orgId: string;
    status: string;
    transcript?: string;
    messages?: Array<{
      role: 'assistant' | 'user' | 'system';
      message: string;
      time: number;
      endTime?: number;
      secondsFromStart: number;
    }>;
  };
  message?: {
    role: 'assistant' | 'user';
    content: string;
    time: number;
    endTime?: number;
    secondsFromStart: number;
  };
  transcript?: {
    role: 'assistant' | 'user';
    transcriptType: 'partial' | 'final';
    transcript: string;
    timestamp: number;
  };
}

// Store for managing call transcripts
const callTranscripts = new Map<string, Array<{
  speaker: string;
  message: string;
  timestamp: number;
}>>();

// Store for buffering partial messages
const messageBuffers = new Map<string, {
  assistant: string;
  user: string;
  lastAssistantTime: number;
  lastUserTime: number;
}>();

export async function POST(request: NextRequest) {
  try {
    // Verify VAPI webhook signature (implement based on your setup)
    // const signature = request.headers.get('x-vapi-signature');
    // TODO: Implement signature verification
    
    const event: VAPIWebhookEvent = await request.json();
    
    console.log('🎯 VAPI Webhook Event:', {
      type: event.type,
      callId: event.call?.id,
      status: event.call?.status,
      hasMessages: !!event.call?.messages?.length,
      hasTranscript: !!event.transcript
    });

    switch (event.type) {
      case 'conversation-update':
        await handleConversationUpdate(event);
        break;
        
      case 'transcript':
        await handleTranscriptEvent(event);
        break;
        
      case 'end-of-call-report':
        await handleCallEnd(event);
        break;
        
      case 'status-update':
        console.log(`📞 Call ${event.call.id} status: ${event.call.status}`);
        break;
        
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleConversationUpdate(event: VAPIWebhookEvent) {
  const callId = event.call.id;
  const messages = event.call.messages || [];
  
  console.log(`📚 Conversation update for call ${callId}: ${messages.length} messages`);
  
  // Filter out system messages and process only user/assistant
  const validMessages = messages.filter(msg => 
    msg.role !== 'system' && 
    msg.message?.trim() && 
    msg.message.trim().length > 0
  );
  
  if (validMessages.length === 0) return;
  
  // Build clean transcript
  const transcript = validMessages.map(msg => ({
    speaker: msg.role === 'assistant' ? 'Interviewer' : 'You',
    message: msg.message.trim(),
    timestamp: msg.time || Date.now()
  }));
  
  // Store the clean transcript
  callTranscripts.set(callId, transcript);
  
  // Broadcast to connected clients (if any)
  await broadcastTranscriptUpdate(callId, transcript);
  
  console.log(`✅ Updated transcript for call ${callId}: ${transcript.length} messages`);
}

async function handleTranscriptEvent(event: VAPIWebhookEvent) {
  if (!event.transcript) return;
  
  const callId = event.call.id;
  const { role, transcript, transcriptType } = event.transcript;
  
  // Only process final transcripts to avoid duplicates
  if (transcriptType !== 'final') return;
  
  console.log(`📝 Final transcript for call ${callId}: ${role} - "${transcript.substring(0, 50)}..."`);
  
  // const buffer = messageBuffers.get(callId) || {
  //   assistant: '',
  //   user: '',
  //   lastAssistantTime: 0,
  //   lastUserTime: 0
  // };
  
  const speaker = role === 'assistant' ? 'Interviewer' : 'You';
  const currentTranscript = callTranscripts.get(callId) || [];
  
  // Add the final transcript message
  const newMessage = {
    speaker,
    message: transcript.trim(),
    timestamp: Date.now()
  };
  
  // Check for duplicates
  const isDuplicate = currentTranscript.some(msg => 
    msg.speaker === speaker && 
    (msg.message === transcript.trim() || 
     transcript.trim().includes(msg.message) ||
     msg.message.includes(transcript.trim()))
  );
  
  if (!isDuplicate) {
    currentTranscript.push(newMessage);
    callTranscripts.set(callId, currentTranscript);
    
    // Broadcast update
    await broadcastTranscriptUpdate(callId, currentTranscript);
    
    console.log(`➕ Added ${speaker} message to call ${callId}`);
  } else {
    console.log(`⚠️ Skipped duplicate message for call ${callId}`);
  }
}

async function handleCallEnd(event: VAPIWebhookEvent) {
  const callId = event.call.id;
  const finalTranscript = callTranscripts.get(callId) || [];
  
  console.log(`🏁 Call ${callId} ended. Final transcript: ${finalTranscript.length} messages`);
  
  if (finalTranscript.length > 0) {
    try {
      // Save to Firestore with a specific document ID pattern
      const transcriptDoc = {
        callId,
        transcript: finalTranscript.map(msg => `${msg.speaker}: ${msg.message}`),
        structuredTranscript: finalTranscript,
        callDuration: event.call.transcript ? calculateDuration(finalTranscript) : 0,
        callEndTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        source: 'vapi-webhook'
      };
      
      await adminDb.collection('call-transcripts').doc(callId).set(transcriptDoc);
      
      console.log(`💾 Saved transcript for call ${callId} to Firestore`);
      
      // Broadcast final transcript
      await broadcastTranscriptUpdate(callId, finalTranscript, true);
      
    } catch (error) {
      console.error(`❌ Failed to save transcript for call ${callId}:`, error);
    }
  }
  
  // Cleanup
  callTranscripts.delete(callId);
  messageBuffers.delete(callId);
}

async function broadcastTranscriptUpdate(
  callId: string, 
  transcript: Array<{speaker: string, message: string, timestamp: number}>,
  isFinal: boolean = false
) {
  // TODO: Implement real-time broadcast to connected clients
  // This could use WebSockets, Server-Sent Events, or polling
  
  // For now, we'll store in a way that the client can poll
  try {
    await adminDb.collection('live-transcripts').doc(callId).set({
      transcript,
      lastUpdated: new Date().toISOString(),
      isFinal,
      messageCount: transcript.length
    });
  } catch (error) {
    console.error('❌ Failed to broadcast transcript update:', error);
  }
}

function calculateDuration(transcript: Array<{timestamp: number}>): number {
  if (transcript.length < 2) return 0;
  const start = Math.min(...transcript.map(t => t.timestamp));
  const end = Math.max(...transcript.map(t => t.timestamp));
  return Math.floor((end - start) / 1000);
}

// Allow CORS for webhook
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-vapi-signature',
    },
  });
}
