import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeetingControls from '../components/MeetingControls';
import EmotionMetrics from '../components/EmotionMetrics';
import { StudentEmotion } from '../components/EmotionMetrics';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getUserMedia, 
  stopMediaStream, 
  attachMediaStream, 
  getDisplayMedia,
  createMultipleStudentStreams,
  getVideoInputDevices,
  checkCameraAccess
} from '../utils/videoUtils';
import { startEmotionDetection } from '../utils/emotionDetection';
import { X, User, AlertTriangle, Users as UsersIcon, Camera, CameraOff } from 'lucide-react';

// Interface for student streams
interface StudentStream {
  id: string;
  name: string;
  stream: MediaStream;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const Meeting = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // UI state
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentStreams, setStudentStreams] = useState<StudentStream[]>([]);
  const [activeView, setActiveView] = useState<'grid' | 'speaker'>('grid');
  const [focusedStudent, setFocusedStudent] = useState<string | null>(null);
  const [videoCameraCount, setVideoCameraCount] = useState(0);
  const [cameraAccessChecked, setCameraAccessChecked] = useState(false);
  
  // Emotion detection
  const [emotionData, setEmotionData] = useState<StudentEmotion[]>([]);
  const [showEmotionMetrics, setShowEmotionMetrics] = useState(false);
  
  // References to video elements
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Mock participants
  const participants = [
    { id: '1', name: 'Teacher Smith', role: 'teacher', isActive: true },
    { id: '2', name: 'Alice Johnson', role: 'student', isActive: true },
    { id: '3', name: 'Bob Smith', role: 'student', isActive: true },
    { id: '4', name: 'Charlie Brown', role: 'student', isActive: true },
    { id: '5', name: 'Diana Prince', role: 'student', isActive: false },
  ];
  
  // Check camera access first
  useEffect(() => {
    const checkCamera = async () => {
      const cameraStatus = await checkCameraAccess();
      console.log("Camera access check:", cameraStatus);
      setCameraAccessChecked(true);
    };
    
    checkCamera();
  }, []);
  
  // Initialize meeting with media access
  useEffect(() => {
    if (!cameraAccessChecked) return;
    
    const initializeMedia = async () => {
      try {
        console.log("Initializing media streams...");
        
        // Check how many video cameras are available
        const videoDevices = await getVideoInputDevices();
        setVideoCameraCount(videoDevices.length);
        console.log(`Found ${videoDevices.length} camera devices in total`);
        
        if (videoDevices.length === 0) {
          toast({
            variant: "destructive", // Changed from "warning" to "destructive" since warning isn't defined yet
            title: "No cameras detected",
            description: "Please check your camera permissions.",
          });
          setErrorMessage("No cameras detected. Please check your camera permissions.");
          return;
        }
        
        // Get user media stream for the teacher
        const stream = await getUserMedia(true, true);
        console.log("Teacher stream created:", stream.id);
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          console.log("Attaching local stream to teacher's video element");
          attachMediaStream(localVideoRef.current, stream);
        } else {
          console.error("Local video element reference is null");
        }
        
        // Create student streams with real cameras where possible
        console.log("Creating student streams with real cameras");
        const mockStudents = await createMultipleStudentStreams(4);
        
        // Add video refs to each student
        const studentsWithRefs = mockStudents.map(student => ({
          ...student,
          videoRef: React.createRef<HTMLVideoElement>(),
        }));
        
        setStudentStreams(studentsWithRefs);
        
        // Count real camera streams vs canvas streams
        const realCameraCount = mockStudents.filter(s => 
          s.stream.getVideoTracks()[0]?.label && 
          !s.stream.getVideoTracks()[0]?.label.includes('canvas')
        ).length;
        
        console.log(`Successfully created ${mockStudents.length} student streams (${realCameraCount} with real cameras)`);
        
        // Show success message
        toast({
          title: "Connected to meeting",
          description: `You've joined meeting ID: ${meetingId} with ${mockStudents.length} students`,
        });
        
        // Start emotion detection if user is a teacher
        if (user?.role === 'teacher') {
          const emotionDetection = startEmotionDetection((data) => {
            setEmotionData(data);
            setShowEmotionMetrics(true);
          });
          
          // Clean up emotion detection on unmount
          return () => {
            emotionDetection.stop();
          };
        }
      } catch (error) {
        console.error('Error initializing media:', error);
        setErrorMessage('Could not access camera or microphone. Please check permissions.');
        
        toast({
          variant: "destructive",
          title: "Media access error",
          description: "Could not access camera or microphone. Please check permissions.",
        });
      }
    };
    
    initializeMedia();
    
    // Clean up on unmount
    return () => {
      console.log("Cleaning up media streams");
      stopMediaStream(localStream);
      
      // Clean up all student streams
      studentStreams.forEach(student => {
        stopMediaStream(student.stream);
      });
      
      stopMediaStream(screenStream);
    };
  }, [meetingId, toast, user?.role, cameraAccessChecked]);
  
  // Attach student streams to video elements when they're available
  useEffect(() => {
    console.log(`Attaching ${studentStreams.length} student streams to video elements`);
    studentStreams.forEach(student => {
      if (student.videoRef?.current && student.stream) {
        console.log(`Attaching stream ${student.stream.id} for student ${student.name}`);
        attachMediaStream(student.videoRef.current, student.stream);
        
        // Log video tracks info
        const videoTracks = student.stream.getVideoTracks();
        console.log(`Student ${student.name} has ${videoTracks.length} video tracks:`, 
          videoTracks.map(t => ({ 
            enabled: t.enabled, 
            muted: t.muted, 
            label: t.label,
            id: t.id
          }))
        );
      } else {
        console.warn(`Video ref or stream for student ${student.name} is not available`, {
          hasRef: !!student.videoRef?.current,
          hasStream: !!student.stream
        });
      }
    });
  }, [studentStreams]);
  
  // Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(audioTracks[0]?.enabled || false);
    }
  };
  
  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(videoTracks[0]?.enabled || false);
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      stopMediaStream(screenStream);
      setScreenStream(null);
      
      // Reattach local stream to video element
      attachMediaStream(localVideoRef.current, localStream);
      setIsScreenSharing(false);
      
      toast({
        title: "Screen sharing stopped",
      });
    } else {
      try {
        // Start screen sharing
        const displayStream = await getDisplayMedia();
        setScreenStream(displayStream);
        
        // Replace local video with screen sharing
        attachMediaStream(localVideoRef.current, displayStream);
        setIsScreenSharing(true);
        
        // Set up listener for when user stops sharing via browser UI
        displayStream.getVideoTracks()[0].onended = () => {
          attachMediaStream(localVideoRef.current, localStream);
          setIsScreenSharing(false);
          
          toast({
            title: "Screen sharing stopped",
          });
        };
        
        toast({
          title: "Screen sharing started",
        });
      } catch (error) {
        console.error('Screen sharing error:', error);
        
        toast({
          variant: "destructive",
          title: "Screen sharing error",
          description: "Could not share your screen. Please try again.",
        });
      }
    }
  };
  
  // End meeting
  const endMeeting = () => {
    // Stop all media streams
    stopMediaStream(localStream);
    
    // Stop all student streams
    studentStreams.forEach(student => {
      stopMediaStream(student.stream);
    });
    
    stopMediaStream(screenStream);
    
    // Navigate back to dashboard
    navigate('/dashboard');
    
    toast({
      title: "Meeting ended",
      description: "You have left the meeting.",
    });
  };
  
  // Toggle participants sidebar
  const toggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (isChatOpen && !isParticipantsOpen) {
      setIsChatOpen(false);
    }
  };
  
  // Toggle chat sidebar
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isParticipantsOpen && !isChatOpen) {
      setIsParticipantsOpen(false);
    }
  };

  // Toggle view mode (grid or speaker)
  const toggleView = () => {
    setActiveView(activeView === 'grid' ? 'speaker' : 'grid');
  };

  // Focus on a specific student
  const focusOnStudent = (studentId: string) => {
    setFocusedStudent(studentId === focusedStudent ? null : studentId);
    if (studentId !== focusedStudent) {
      setActiveView('speaker');
    }
  };
  
  // If there's an error, show error screen
  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Media Access Error</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {videoCameraCount === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <CameraOff size={16} />
          No cameras detected. Please check your camera permissions.
        </div>
      )}
      
      {/* View toggle button */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="outline" 
          className="bg-black/50 text-white border-gray-600 hover:bg-black/70"
          onClick={toggleView}
        >
          {activeView === 'grid' ? 'Speaker View' : 'Grid View'}
        </Button>
      </div>
      
      {/* Camera count indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/50 text-white px-3 py-1 rounded-md flex items-center gap-2">
          <Camera size={16} />
          <span>Cameras: {videoCameraCount}</span>
        </div>
      </div>
      
      {activeView === 'grid' ? (
        // Grid view layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2 h-full w-full">
          {/* Teacher/Local video */}
          <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 text-sm rounded">
              You (Teacher)
            </div>
          </div>
          
          {/* Student videos */}
          {studentStreams.map((student) => (
            <div 
              key={student.id} 
              className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video cursor-pointer"
              onClick={() => focusOnStudent(student.id)}
            >
              <video
                ref={student.videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 text-sm rounded">
                {student.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Speaker view layout
        <div className="flex flex-col h-full">
          {/* Main video (focused student or teacher) */}
          <div className="flex-1 p-2">
            <div className="relative rounded-lg overflow-hidden bg-gray-900 h-full">
              {focusedStudent ? (
                // Focused student video
                <>
                  <video
                    ref={studentStreams.find(s => s.id === focusedStudent)?.videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 text-md rounded">
                    {studentStreams.find(s => s.id === focusedStudent)?.name}
                  </div>
                </>
              ) : (
                // Default to teacher if no student is focused
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 text-md rounded">
                    You (Teacher)
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Thumbnails row */}
          <div className="h-24 p-2">
            <div className="flex space-x-2 h-full">
              {/* Teacher thumbnail */}
              <div 
                className={`relative rounded-lg overflow-hidden bg-gray-900 h-full aspect-video cursor-pointer ${!focusedStudent ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setFocusedStudent(null)}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black/60 text-white px-1 py-0.5 text-xs rounded">
                  You
                </div>
              </div>
              
              {/* Student thumbnails */}
              {studentStreams.map((student) => (
                <div 
                  key={student.id} 
                  className={`relative rounded-lg overflow-hidden bg-gray-900 h-full aspect-video cursor-pointer ${student.id === focusedStudent ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => focusOnStudent(student.id)}
                >
                  <video
                    ref={student.videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white px-1 py-0.5 text-xs rounded">
                    {student.name.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Meeting controls */}
      <MeetingControls
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        toggleMic={toggleMic}
        toggleCamera={toggleCamera}
        toggleScreenShare={toggleScreenShare}
        endMeeting={endMeeting}
        toggleParticipants={toggleParticipants}
        toggleChat={toggleChat}
        isParticipantsOpen={isParticipantsOpen}
        isChatOpen={isChatOpen}
      />
      
      {/* Participants sidebar */}
      <Sheet open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Participants ({participants.length})</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-64px)]">
            <div className="p-4 space-y-4">
              {participants.map((participant) => (
                <div 
                  key={participant.id}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${participant.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Chat sidebar */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Chat</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100vh-64px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex flex-col items-start">
                  <div className="bg-gray-100 rounded-lg p-3 mb-1 max-w-[80%]">
                    <p className="text-sm">Has everyone completed the homework assignment?</p>
                  </div>
                  <span className="text-xs text-gray-500">Teacher Smith • 10:15 AM</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="bg-blue-100 rounded-lg p-3 mb-1 max-w-[80%]">
                    <p className="text-sm">Yes, I submitted mine yesterday.</p>
                  </div>
                  <span className="text-xs text-gray-500">You • 10:16 AM</span>
                </div>
                
                <div className="flex flex-col items-start">
                  <div className="bg-gray-100 rounded-lg p-3 mb-1 max-w-[80%]">
                    <p className="text-sm">I had a question about problem #3. Can we review it?</p>
                  </div>
                  <span className="text-xs text-gray-500">Alice Johnson • 10:17 AM</span>
                </div>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button>Send</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Emotion metrics for teachers */}
      {user?.role === 'teacher' && (
        <div className="absolute top-16 left-4 z-10 w-80">
          <EmotionMetrics 
            emotionData={emotionData} 
            isVisible={showEmotionMetrics}
          />
        </div>
      )}
    </div>
  );
};

export default Meeting;
