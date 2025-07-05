
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Brain, Coffee, BookOpen } from 'lucide-react';

export interface StudentEmotion {
  studentId: string;
  studentName: string;
  emotion: 'engaged' | 'bored' | 'sleepy';
  confidence: number;
  timestamp: string;
}

interface EmotionMetricsProps {
  emotionData: StudentEmotion[];
  isVisible: boolean;
  className?: string;
}

const EmotionMetrics: React.FC<EmotionMetricsProps> = ({ emotionData, isVisible, className = '' }) => {
  if (!isVisible) return null;

  // Calculate aggregate metrics
  const totalStudents = emotionData.length;
  const engagedCount = emotionData.filter(s => s.emotion === 'engaged').length;
  const boredCount = emotionData.filter(s => s.emotion === 'bored').length;
  const sleepyCount = emotionData.filter(s => s.emotion === 'sleepy').length;

  const engagedPercentage = Math.round((engagedCount / totalStudents) * 100) || 0;
  const boredPercentage = Math.round((boredCount / totalStudents) * 100) || 0;
  const sleepyPercentage = Math.round((sleepyCount / totalStudents) * 100) || 0;

  // Suggested actions based on class emotion
  const suggestedActions = {
    engaged: [
      'Continue with current teaching pace',
      'Introduce more complex concepts',
      'Encourage peer discussions',
    ],
    bored: [
      'Try an interactive activity or quick quiz',
      'Relate content to real-world scenarios',
      'Ask open-ended questions',
    ],
    sleepy: [
      'Take a short energizer break',
      'Switch to more interactive teaching',
      'Use multimedia or visual aids',
    ],
  };

  // Determine the dominant emotion
  let dominantEmotion: 'engaged' | 'bored' | 'sleepy' = 'engaged';
  const maxCount = Math.max(engagedCount, boredCount, sleepyCount);
  
  if (maxCount === boredCount) dominantEmotion = 'bored';
  if (maxCount === sleepyCount) dominantEmotion = 'sleepy';

  return (
    <Card className={`w-full transition-all duration-300 animate-fade-in ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Class Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="actions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Engaged</span>
                </div>
                <span className="text-sm font-medium">{engagedPercentage}%</span>
              </div>
              <Progress value={engagedPercentage} className="h-2" indicatorClassName="bg-green-600" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">Bored</span>
                </div>
                <span className="text-sm font-medium">{boredPercentage}%</span>
              </div>
              <Progress value={boredPercentage} className="h-2" indicatorClassName="bg-yellow-600" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Coffee className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium">Sleepy</span>
                </div>
                <span className="text-sm font-medium">{sleepyPercentage}%</span>
              </div>
              <Progress value={sleepyPercentage} className="h-2" indicatorClassName="bg-red-600" />
            </div>

            <Separator className="my-4" />

            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="text-sm font-medium mb-2">Class Status</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  dominantEmotion === 'engaged' ? 'bg-green-500' : 
                  dominantEmotion === 'bored' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm">
                  {dominantEmotion === 'engaged' ? 'Mostly engaged' : 
                   dominantEmotion === 'bored' ? 'Signs of boredom' : 'Low energy levels'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {emotionData.map((student) => (
                <div key={student.studentId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                      {student.studentName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{student.studentName}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs emotion-${student.emotion}`}>
                    {student.emotion.charAt(0).toUpperCase() + student.emotion.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Brain className="h-4 w-4 text-green-600 mr-2" />
                  For Engaged Students
                </h4>
                <ul className="space-y-1">
                  {suggestedActions.engaged.map((action, index) => (
                    <li key={index} className="text-sm pl-6 relative">
                      <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 text-yellow-600 mr-2" />
                  For Bored Students
                </h4>
                <ul className="space-y-1">
                  {suggestedActions.bored.map((action, index) => (
                    <li key={index} className="text-sm pl-6 relative">
                      <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Coffee className="h-4 w-4 text-red-600 mr-2" />
                  For Sleepy Students
                </h4>
                <ul className="space-y-1">
                  {suggestedActions.sleepy.map((action, index) => (
                    <li key={index} className="text-sm pl-6 relative">
                      <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmotionMetrics;
