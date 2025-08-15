import Vapi from "@vapi-ai/web";

console.log('🔑 VAPI SDK initialization:', {
  hasApiKey: !!process.env.NEXT_PUBLIC_VAPI_API_KEY,
  keyLength: process.env.NEXT_PUBLIC_VAPI_API_KEY?.length || 0,
  keyPreview: process.env.NEXT_PUBLIC_VAPI_API_KEY?.substring(0, 8) + '...'
});

export const vapi = process.env.NEXT_PUBLIC_VAPI_API_KEY 
  ? new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY)
  : null;