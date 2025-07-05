
// Helper functions for managing media streams and devices

/**
 * Get user media stream (camera and/or microphone)
 */
export const getUserMedia = async (video = true, audio = true) => {
  try {
    const constraints = {
      video: video ? { width: 1280, height: 720 } : false,
      audio,
    };
    
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

/**
 * Get user media stream with a specific device ID
 */
export const getUserMediaWithDeviceId = async (deviceId: string, audio = true) => {
  try {
    console.log(`Getting user media with device ID: ${deviceId}`);
    const constraints = {
      video: { 
        deviceId: { exact: deviceId },
        width: 1280, 
        height: 720 
      },
      audio,
    };
    
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error(`Error accessing media device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Get available video input devices
 */
export const getVideoInputDevices = async () => {
  try {
    // First request permission to access media devices
    const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // Stop the stream immediately - we just needed it to get permissions
    stopMediaStream(initialStream);
    
    // Now enumerate devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log(`Found ${videoDevices.length} video devices:`, videoDevices);
    return videoDevices;
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return [];
  }
};

/**
 * Get display media stream (screen sharing)
 */
export const getDisplayMedia = async () => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  } catch (error) {
    console.error('Error sharing screen:', error);
    throw error;
  }
};

/**
 * Stop all tracks in a media stream
 */
export const stopMediaStream = (stream: MediaStream | null) => {
  if (!stream) return;
  stream.getTracks().forEach(track => {
    track.stop();
  });
};

/**
 * Add track to an HTML video element
 */
export const attachMediaStream = (videoElement: HTMLVideoElement | null, stream: MediaStream | null) => {
  if (!videoElement || !stream) {
    console.log("Cannot attach stream - video element or stream is null");
    return;
  }
  
  console.log("Attaching media stream to video element", stream.id);
  videoElement.srcObject = stream;
  
  // Ensure the video plays by handling the loadedmetadata event
  videoElement.onloadedmetadata = () => {
    videoElement.play().catch(e => console.error('Error playing video:', e));
  };
};

/**
 * Replace tracks in a stream with tracks from another stream
 */
export const replaceMediaStreamTracks = (oldStream: MediaStream | null, newStream: MediaStream) => {
  if (!oldStream) return newStream;
  
  oldStream.getTracks().forEach(track => {
    track.stop();
  });
  
  const newStreamTracks = newStream.getTracks();
  
  newStreamTracks.forEach(newTrack => {
    oldStream.addTrack(newTrack);
  });
  
  return oldStream;
};

/**
 * Create multiple student streams for simulating multiple students
 * Using REAL cameras for ALL students when possible
 */
export const createMultipleStudentStreams = async (count: number) => {
  console.log(`Creating ${count} student streams with real cameras`);
  const streams: { id: string; name: string; stream: MediaStream }[] = [];
  
  try {
    // First request permission to access media devices
    const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Get all available video devices
    const videoDevices = await getVideoInputDevices();
    console.log(`Detected ${videoDevices.length} camera devices`);
    
    // Teacher will use the device that's already active
    const teacherTrack = initialStream.getVideoTracks()[0];
    const teacherDeviceId = teacherTrack ? teacherTrack.getSettings().deviceId : '';
    
    console.log(`Teacher using device ID: ${teacherDeviceId}`);
    
    // Filter out the teacher's device
    const studentVideoDevices = videoDevices.filter(device => 
      device.deviceId !== teacherDeviceId && device.deviceId !== ''
    );
    
    console.log(`Found ${studentVideoDevices.length} additional devices for students`);
    
    // Stop the initial stream as we'll create individual streams
    stopMediaStream(initialStream);
    
    // For real cameras: create a separate stream for each device
    for (let i = 0; i < Math.min(count, studentVideoDevices.length); i++) {
      try {
        const deviceId = studentVideoDevices[i].deviceId;
        console.log(`Creating stream for student ${i+1} with device ID: ${deviceId}`);
        
        // Create a new constraint for this specific device
        const constraints = {
          video: { 
            deviceId: { exact: deviceId },
            width: 640,  // Use smaller resolution
            height: 480  // Use smaller resolution
          },
          audio: true
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(`Successfully created stream with ID ${stream.id} for student ${i+1}`);
        
        streams.push({
          id: `${i + 1}`,
          name: getStudentName(i),
          stream,
        });
      } catch (err) {
        console.error(`Failed to access real camera for student ${i+1}:`, err);
        // Fall back to canvas stream
        const canvasStream = await createCanvasStreamWithName(`Student ${i+1}`);
        streams.push({
          id: `${i + 1}`,
          name: getStudentName(i),
          stream: canvasStream,
        });
      }
    }
    
    // If we need more streams than available cameras, create canvas streams
    for (let i = streams.length; i < count; i++) {
      console.log(`Creating canvas stream for student ${i+1} (not enough cameras)`);
      const canvasStream = await createCanvasStreamWithName(`Student ${i+1}`);
      streams.push({
        id: `${i + 1}`,
        name: getStudentName(i),
        stream: canvasStream,
      });
    }
    
    console.log(`Successfully created ${streams.length} student streams`);
    return streams;
  } catch (error) {
    console.error('Error creating student streams:', error);
    
    // Fall back to all canvas streams if something went wrong
    return createAllCanvasStreams(count);
  }
};

/**
 * Create all canvas-based streams as a fallback
 */
const createAllCanvasStreams = async (count: number) => {
  console.log(`Creating ${count} canvas-based student streams as fallback`);
  const streams: { id: string; name: string; stream: MediaStream }[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const stream = await createCanvasStreamWithName(`Student ${i+1}`);
      streams.push({
        id: `${i + 1}`,
        name: getStudentName(i),
        stream,
      });
    } catch (error) {
      console.error(`Failed to create canvas stream for student ${i+1}:`, error);
    }
  }
  
  return streams;
};

/**
 * Get a random student name
 */
const getStudentName = (index: number) => {
  const names = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Prince',
    'Evan Williams',
    'Fiona Apple',
    'George Miller',
    'Hannah Montana',
  ];
  
  return names[index % names.length];
};

/**
 * Creates a canvas-based stream with a specific student name
 */
const createCanvasStreamWithName = async (name: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Create a random color for this student
    const colors = ['#4338ca', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];
    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
    
    const gradient = ctx.createLinearGradient(0, 0, 640, 480);
    gradient.addColorStop(0, randomColor1);
    gradient.addColorStop(1, randomColor2);
    
    const animate = () => {
      if (!ctx) return;
      
      // Clear the canvas
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the text
      const time = new Date().toLocaleTimeString();
      ctx.font = '40px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '30px Arial';
      ctx.fillText(time, canvas.width / 2, canvas.height / 2 + 30);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  try {
    // @ts-ignore - Canvas captureStream is not in the TypeScript types
    const stream = canvas.captureStream(30);
    
    // Fake audio for canvas streams - no longer trying to add real audio
    // since it would conflict with other streams
    
    return stream;
  } catch (error) {
    console.error(`Error creating canvas stream for ${name}:`, error);
    throw error;
  }
};

/**
 * Modified function to check camera access and capabilities
 */
export const checkCameraAccess = async () => {
  try {
    // Request camera permissions
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const tracks = stream.getVideoTracks();
    
    if (tracks.length === 0) {
      return { success: false, message: "No camera detected", device: null };
    }
    
    const deviceInfo = {
      label: tracks[0].label,
      id: tracks[0].getSettings().deviceId,
      resolution: {
        width: tracks[0].getSettings().width,
        height: tracks[0].getSettings().height
      }
    };
    
    // Clean up
    stopMediaStream(stream);
    
    return {
      success: true,
      message: "Camera access granted",
      device: deviceInfo
    };
  } catch (err) {
    console.error("Camera access error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown camera error",
      device: null
    };
  }
};
