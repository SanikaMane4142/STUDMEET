
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeEmotionWithAI, isOpenAIInitialized } from '../utils/openaiApi';
import OpenAISetup from './OpenAISetup';
import { useToast } from '@/hooks/use-toast';

const AIEmotionAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a description to analyze',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await analyzeEmotionWithAI(prompt);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing with OpenAI:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">AI Emotion Analyzer</h2>
      
      {!isOpenAIInitialized() && (
        <OpenAISetup />
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="promptInput" className="block text-sm font-medium mb-1">
            Describe student behavior or context to analyze:
          </label>
          <Textarea
            id="promptInput"
            placeholder="Example: 'During the math lesson, five students in the back were constantly checking their phones and yawning.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading || !isOpenAIInitialized()}
          className="w-full"
        >
          {isLoading ? 'Analyzing...' : 'Analyze with AI'}
        </Button>

        {analysis && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium mb-2">AI Analysis:</h3>
            <p className="text-gray-700">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEmotionAnalyzer;
