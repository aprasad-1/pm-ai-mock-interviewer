import Vapi from "@vapi-ai/web";

// Create a single instance to avoid React re-render issues
let vapiInstance: Vapi | null = null;

export const getVapi = (): Vapi | null => {
  if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
    console.error('VAPI API key not found in environment variables');
    return null;
  }

  if (!vapiInstance) {
    try {
      vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
    } catch (error) {
      console.error('Failed to create VAPI instance:', error);
      return null;
    }
  }

  return vapiInstance;
};

// Function to reset VAPI instance (useful for testing)
export const resetVapi = () => {
  if (vapiInstance) {
    try {
      vapiInstance.stop();
    } catch (error) {
      console.warn('Error stopping VAPI instance:', error);
    }
    vapiInstance = null;
  }
};

// Get assistant ID by category
export const getAssistantIdByCategory = (categoryId: string): string | null => {
  const assistantMap: Record<string, string> = {
    'product-design': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_PRODUCT_DESIGN || '',
    'product-strategy': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_PRODUCT_STRATEGY || '',
    'analytical-metrics': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ANALYTICAL || '',
    'execution-problem-solving': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_EXECUTION || '',
    'estimation-market-sizing': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ESTIMATION || '',
    'behavioral-cultural-fit': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_BEHAVIORAL || '',
    'technical-pm': process.env.NEXT_PUBLIC_VAPI_ASSISTANT_TECHNICAL || ''
  };
  
  return assistantMap[categoryId] || null;
};

// Export the instance for backward compatibility
export const vapi = getVapi();