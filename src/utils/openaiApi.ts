
import OpenAI from 'openai';

// This is a frontend-only implementation
// In a production app, you would handle API keys on the server side
let openaiInstance: OpenAI | null = null;
let storedApiKey: string | null = null;

/**
 * Initialize the OpenAI client with an API key
 */
export const initializeOpenAI = (apiKey: string): OpenAI => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  // Store the API key and create a new instance
  storedApiKey = apiKey;
  localStorage.setItem('openai_api_key', apiKey);
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: this is not recommended for production
  });
  
  return openaiInstance;
};

/**
 * Get the OpenAI client instance, initializing it with a stored key if available
 */
export const getOpenAIInstance = (): OpenAI | null => {
  if (openaiInstance) {
    return openaiInstance;
  }
  
  // Try to get the API key from localStorage
  const savedApiKey = localStorage.getItem('openai_api_key');
  if (savedApiKey) {
    return initializeOpenAI(savedApiKey);
  }
  
  return null;
};

/**
 * Check if OpenAI is initialized with a valid API key
 */
export const isOpenAIInitialized = (): boolean => {
  return !!openaiInstance || !!localStorage.getItem('openai_api_key');
};

/**
 * Generate a response using OpenAI's chat completions
 */
export const generateChatCompletion = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { model?: string; temperature?: number; max_tokens?: number } = {}
): Promise<string> => {
  const openai = getOpenAIInstance();
  if (!openai) {
    throw new Error('OpenAI has not been initialized. Please provide an API key.');
  }

  const completion = await openai.chat.completions.create({
    model: options.model || 'gpt-4o-mini',
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1000,
  });

  return completion.choices[0].message.content || '';
};

/**
 * Verify a user's identity using OpenAI
 */
export const verifyUserWithAI = async (userInput: string): Promise<boolean> => {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an authentication assistant. Verify if the provided information looks like valid authentication data. Respond only with "true" or "false".'
      },
      {
        role: 'user' as const,
        content: `Verify this authentication attempt: ${userInput}`
      }
    ];

    const response = await generateChatCompletion(messages, {
      temperature: 0.1,
      max_tokens: 10
    });

    return response.toLowerCase().includes('true');
  } catch (error) {
    console.error('Error verifying user with AI:', error);
    return false;
  }
};

/**
 * Analyze a prompt using OpenAI
 */
export const analyzeEmotionWithAI = async (prompt: string): Promise<string> => {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an assistant that analyzes student engagement and emotions based on descriptions. Provide a short concise analysis.'
    },
    {
      role: 'user' as const,
      content: prompt
    }
  ];

  return generateChatCompletion(messages, {
    temperature: 0.5,
    max_tokens: 150
  });
};
