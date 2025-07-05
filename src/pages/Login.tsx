
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import OpenAISetup from '../components/OpenAISetup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('student');
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'ai'>('login');
  
  const { login, signup, error, connectionError } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled by the auth context and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password strength (optional)
    if (signupPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSigningUp(true);
    
    try {
      await signup(signupEmail, signupPassword, signupRole);
    } catch (error) {
      console.error('Signup failed:', error);
      // Error is handled by the auth context
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleAILoginComplete = () => {
    toast({
      title: "AI Authentication Complete",
      description: "You can now proceed with login using your credentials",
    });
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to StudMeet</h1>
            <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
          </div>

          {connectionError && (
            <Alert variant="destructive" className="mb-4">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                Unable to connect to the authentication service. Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup' | 'ai')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="ai">AI Auth</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)} className="flex space-x-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="teacher" id="teacher" />
                          <Label htmlFor="teacher" className="cursor-pointer">Teacher</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="student" id="student" />
                          <Label htmlFor="student" className="cursor-pointer">Student</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {error && !connectionError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting || connectionError}>
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>

                    {/* Demo mode for development */}
                    {import.meta.env.DEV && (
                      <Alert className="mt-4 bg-amber-50 border-amber-200">
                        <Wifi className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="text-amber-700">Developer Mode</AlertTitle>
                        <AlertDescription className="text-amber-600">
                          This is a demo environment. You can use test@example.com / password123 to sign in.
                        </AlertDescription>
                      </Alert>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('signup')} 
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Sign up now
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Sign up for a new StudMeet account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Email</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="name@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <RadioGroup value={signupRole} onValueChange={(value) => setSignupRole(value as UserRole)} className="flex space-x-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="teacher" id="signupTeacher" />
                          <Label htmlFor="signupTeacher" className="cursor-pointer">Teacher</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="student" id="signupStudent" />
                          <Label htmlFor="signupStudent" className="cursor-pointer">Student</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {error && !connectionError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isSigningUp || connectionError}>
                      {isSigningUp ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('login')} 
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Sign in
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* AI Authentication Tab */}
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Authentication</CardTitle>
                  <CardDescription>Use OpenAI to verify your identity</CardDescription>
                </CardHeader>
                <CardContent>
                  <OpenAISetup forAuthentication={true} onSetupComplete={handleAILoginComplete} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Login;
