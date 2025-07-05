import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Video, Users, Calendar, Copy, Clipboard, ArrowRight, Activity, BarChart3, BookOpen } from 'lucide-react';
import StudentDashboard from '@/components/StudentDashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock recent meetings data
const recentMeetings = [
  { id: '1', name: 'Physics Class', date: '2023-05-15', time: '09:00 AM', participants: 24, duration: '45 mins' },
  { id: '2', name: 'Chemistry Lab', date: '2023-05-14', time: '11:30 AM', participants: 18, duration: '60 mins' },
  { id: '3', name: 'Math Review', date: '2023-05-12', time: '02:00 PM', participants: 22, duration: '50 mins' },
];

// Activities to recommend based on engagement levels
const recommendedActivities = {
  Engaged: ['Advanced problem set', 'Group discussion leader', 'Peer tutoring'],
  Bored: ['Interactive quiz', 'Hands-on demonstration', 'Real-world application task'],
  Sleepy: ['Quick energizer activity', 'Stand-up problem solving', 'Multimedia presentation'],
};

interface StudentProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  engagement?: string;
  lastActive?: string;
  attention?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetingLink, setMeetingLink] = useState('');
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const [showJoinMeetingDialog, setShowJoinMeetingDialog] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [joinMeetingLink, setJoinMeetingLink] = useState('');
  const [students, setStudents] = useState<StudentProfile[]>([]);

  const isTeacher = user?.role === 'teacher';

  // Fetch students from database
  useEffect(() => {
    if (isTeacher) {
      const fetchStudents = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');
        
        if (error) {
          console.error('Error fetching students:', error);
          toast({
            variant: "destructive",
            title: "Error fetching students",
            description: error.message,
          });
        } else if (data) {
          // Add mock engagement data for demo purposes
          const studentsWithEngagement = data.map((student, index) => {
            const engagementTypes = ['Engaged', 'Bored', 'Sleepy'];
            const timeAgo = [`2 mins ago`, `1 min ago`, `Just now`, `3 mins ago`, `5 mins ago`];
            const attentions = ['95%', '65%', '45%', '90%', '70%'];
            
            return {
              ...student,
              engagement: engagementTypes[index % engagementTypes.length],
              lastActive: timeAgo[index % timeAgo.length],
              attention: attentions[index % attentions.length],
            };
          });
          
          setStudents(studentsWithEngagement);
        }
      };

      fetchStudents();

      // Set up real-time listener for changes to profiles
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: 'role=eq.student'
          },
          async (payload) => {
            console.log('Real-time update received:', payload);
            
            // Refetch all students when there's a change
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('role', 'student');
            
            if (!error && data) {
              // Add mock engagement data for demo purposes
              const studentsWithEngagement = data.map((student, index) => {
                const engagementTypes = ['Engaged', 'Bored', 'Sleepy'];
                const timeAgo = [`2 mins ago`, `Just now`, `3 mins ago`, `5 mins ago`];
                const attentions = ['95%', '65%', '45%', '90%', '70%'];
                
                return {
                  ...student,
                  engagement: engagementTypes[index % engagementTypes.length],
                  lastActive: timeAgo[index % timeAgo.length],
                  attention: attentions[index % attentions.length],
                };
              });
              
              setStudents(studentsWithEngagement);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isTeacher, toast]);

  const handleStartNewMeeting = () => {
    // Generate a random meeting ID
    const meetingId = Math.random().toString(36).substring(2, 12);
    const link = `${window.location.origin}/meeting/${meetingId}`;
    setMeetingLink(link);
    setShowNewMeetingDialog(true);
  };

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    toast({
      title: "Link copied",
      description: "Meeting link has been copied to clipboard.",
    });
  };

  const handleJoinMeeting = () => {
    if (!joinMeetingLink) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a meeting link to join.",
      });
      return;
    }

    // Extract the meeting ID from the link
    try {
      const url = new URL(joinMeetingLink);
      const pathSegments = url.pathname.split('/');
      const meetingId = pathSegments[pathSegments.length - 1];
      
      // Navigate to the meeting
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid meeting link",
        description: "Please enter a valid meeting link.",
      });
    }
  };

  const handleJoinCreatedMeeting = () => {
    const pathSegments = new URL(meetingLink).pathname.split('/');
    const meetingId = pathSegments[pathSegments.length - 1];
    navigate(`/meeting/${meetingId}`);
  };

  const getEngagementBadgeClass = (engagement: string) => {
    switch (engagement) {
      case 'Engaged':
        return 'bg-green-100 text-green-800';
      case 'Bored':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sleepy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTeacherDashboard = () => (
    <>
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Real-time from database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Meetings</CardTitle>
            <CardDescription>Your last few class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.name}</TableCell>
                    <TableCell>{meeting.date}</TableCell>
                    <TableCell>{meeting.participants}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" size="sm">
              View All Meetings
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>Current class engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.slice(0, 4).map((student) => (
                <div key={student.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      {student.avatar_url && <AvatarImage src={student.avatar_url} alt={student.display_name || 'Student'} />}
                      <AvatarFallback>{student.display_name ? student.display_name[0] : 'S'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{student.display_name || 'Student'}</p>
                      <p className="text-xs text-gray-500">Active {student.lastActive}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${getEngagementBadgeClass(student.engagement || 'Engaged')}`}>
                    {student.engagement}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" size="sm">
              View All Students
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Activities</CardTitle>
          <CardDescription>Based on student engagement levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="font-medium">For Engaged Students</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {recommendedActivities.Engaged.map((activity, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <ArrowRight className="h-3 w-3 text-green-600" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <h4 className="font-medium">For Bored Students</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {recommendedActivities.Bored.map((activity, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <ArrowRight className="h-3 w-3 text-yellow-600" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h4 className="font-medium">For Sleepy Students</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {recommendedActivities.Sleepy.map((activity, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <ArrowRight className="h-3 w-3 text-red-600" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-gray-600">
              {isTeacher ? 'Manage your classes and student engagement' : 'Track your classes and learning progress'}
            </p>
          </div>
          <div className="flex space-x-2">
            {isTeacher ? (
              <Button onClick={handleStartNewMeeting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Video className="mr-2 h-4 w-4" />
                Start New Meeting
              </Button>
            ) : (
              <Button onClick={() => setShowJoinMeetingDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Video className="mr-2 h-4 w-4" />
                Join Meeting
              </Button>
            )}
          </div>
        </div>

        {isTeacher ? renderTeacherDashboard() : <StudentDashboard />}
      </main>

      {/* New Meeting Dialog */}
      <Dialog open={showNewMeetingDialog} onOpenChange={setShowNewMeetingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Meeting</DialogTitle>
            <DialogDescription>
              Share this link with your students to invite them to the meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Meeting Name (optional)"
                value={newMeetingName}
                onChange={(e) => setNewMeetingName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input value={meetingLink} readOnly />
              <Button size="icon" variant="outline" onClick={handleCopyMeetingLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowNewMeetingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinCreatedMeeting}>
              Join Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Meeting Dialog */}
      <Dialog open={showJoinMeetingDialog} onOpenChange={setShowJoinMeetingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Meeting</DialogTitle>
            <DialogDescription>
              Enter the meeting link provided by your teacher.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Paste meeting link here"
                value={joinMeetingLink}
                onChange={(e) => setJoinMeetingLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowJoinMeetingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinMeeting}>
              Join Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
