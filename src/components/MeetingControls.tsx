
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShareOff, ScreenShare, Users, Settings, MessageSquare } from 'lucide-react';

interface MeetingControlsProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  endMeeting: () => void;
  toggleParticipants: () => void;
  toggleChat: () => void;
  isParticipantsOpen: boolean;
  isChatOpen: boolean;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  toggleMic,
  toggleCamera,
  toggleScreenShare,
  endMeeting,
  toggleParticipants,
  toggleChat,
  isParticipantsOpen,
  isChatOpen,
}) => {
  return (
    <div className="meeting-controls fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full p-2 flex items-center space-x-2 z-30">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isMicOn ? "default" : "destructive"} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={toggleMic}
              size="icon"
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMicOn ? 'Turn off microphone' : 'Turn on microphone'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isCameraOn ? "default" : "destructive"} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={toggleCamera}
              size="icon"
            >
              {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCameraOn ? 'Turn off camera' : 'Turn on camera'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isScreenSharing ? "destructive" : "default"} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={toggleScreenShare}
              size="icon"
            >
              {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isScreenSharing ? 'Stop sharing screen' : 'Share screen'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isParticipantsOpen ? "secondary" : "default"} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={toggleParticipants}
              size="icon"
            >
              <Users className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Participants</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isChatOpen ? "secondary" : "default"} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={toggleChat}
              size="icon"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chat</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="destructive" 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={endMeeting}
              size="icon"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>End meeting</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MeetingControls;
