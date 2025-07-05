
import React, { useState, useEffect } from 'react';
import { initializeOpenAI, isOpenAIInitialized, verifyUserWithAI } from '../utils/openaiApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface OpenAISetupProps {
  onSetupComplete?: () => void;
  forAuthentication?: boolean;
}

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  authText: z.string().optional(),
});

const OpenAISetup: React.FC<OpenAISetupProps> = ({ onSetupComplete, forAuthentication = false }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: '',
      authText: '',
    },
  });

  useEffect(() => {
    // Check if OpenAI is already initialized
    setIsInitialized(isOpenAIInitialized());
  }, []);

  const handleSaveKey = async (values: z.infer<typeof formSchema>) => {
    const { apiKey, authText } = values;
    
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your OpenAI API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      initializeOpenAI(apiKey.trim());
      setIsInitialized(true);
      
      // If we're using this for authentication and auth text is provided
      if (forAuthentication && authText) {
        setIsVerifying(true);
        const isVerified = await verifyUserWithAI(authText);
        setIsVerifying(false);
        
        if (isVerified) {
          toast({
            title: 'Authentication Successful',
            description: 'Your identity has been verified',
          });
        } else {
          toast({
            title: 'Authentication Failed',
            description: 'Unable to verify your identity',
            variant: 'destructive',
          });
          return; // Don't proceed if verification fails
        }
      }
      
      toast({
        title: 'Success',
        description: 'OpenAI API key has been saved',
      });
      
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (error) {
      console.error('Error initializing OpenAI:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize OpenAI',
        variant: 'destructive',
      });
    }
  };

  if (isInitialized && !forAuthentication) {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <AlertDescription>
          OpenAI API is configured. You can now use AI features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mb-6 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">
        {forAuthentication ? 'AI-Powered Authentication' : 'OpenAI API Setup'}
      </h3>
      <p className="text-gray-600 mb-4 text-sm">
        {forAuthentication 
          ? 'Please enter your OpenAI API key and provide authentication information to verify your identity.'
          : 'To use AI features, please enter your OpenAI API key. You can get an API key from'}
        {!forAuthentication && (
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 ml-1"
          >
            OpenAI's website
          </a>
        )}
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveKey)} className="space-y-4">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OpenAI API Key</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your OpenAI API key"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Your API key is stored locally in your browser and is not sent to our servers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {forAuthentication && (
            <FormField
              control={form.control}
              name="authText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide information that can verify your identity"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    This information will be processed by AI to verify your identity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button type="submit" disabled={form.formState.isSubmitting || isVerifying}>
            {form.formState.isSubmitting || isVerifying 
              ? (forAuthentication ? 'Verifying...' : 'Saving...')
              : (forAuthentication ? 'Verify & Save' : 'Save Key')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default OpenAISetup;
