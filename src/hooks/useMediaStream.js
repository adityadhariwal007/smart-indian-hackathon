import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust Custom Hook for WebRTC Camera and Microphone access
 * Prevents re-render loops, track-stop thrashing, and video flashing.
 */
export function useMediaStream(autoStart = true) {
  const [stream, setStream] = useState(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const streamRef = useRef(null);
  const isAcquiringRef = useRef(false);

  // Initialize camera and microphone
  const startMedia = useCallback(async () => {
    // If active stream already exists, re-use it without re-requesting hardware
    if (streamRef.current && streamRef.current.active) {
      if (localVideoRef.current && localVideoRef.current.srcObject !== streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      return streamRef.current;
    }

    if (isAcquiringRef.current) return null;
    isAcquiringRef.current = true;
    setIsLoading(true);
    setPermissionError(null);

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('WebRTC camera/microphone access is not supported by this browser.');
      setIsLoading(false);
      isAcquiringRef.current = false;
      return null;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsVideoOff(false);
      setIsAudioMuted(false);
      setIsLoading(false);
      isAcquiringRef.current = false;

      if (localVideoRef.current && localVideoRef.current.srcObject !== mediaStream) {
        localVideoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (err) {
      console.warn('Camera/Mic access notification:', err.name, err.message);
      setIsLoading(false);
      isAcquiringRef.current = false;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera or microphone permission was declined. Please allow camera and microphone in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No video camera or microphone detected on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('Camera is already in use by another application.');
      } else {
        setPermissionError(`Media device error: ${err.message}`);
      }

      return null;
    }
  }, []);

  // Stop all active tracks safely
  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track', e);
        }
      });
      streamRef.current = null;
    }
    setStream(null);

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping screen track', e);
        }
      });
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  // Toggle Video track on/off
  const toggleVideo = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return;
    const videoTracks = currentStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !videoTracks[0].enabled;
      videoTracks[0].enabled = nextState;
      setIsVideoOff(!nextState);
    }
  }, []);

  // Toggle Audio track (Mute/Unmute)
  const toggleAudio = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return;
    const audioTracks = currentStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextState = !audioTracks[0].enabled;
      audioTracks[0].enabled = nextState;
      setIsAudioMuted(!nextState);
    }
  }, []);

  // Screen sharing toggle
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      if (localVideoRef.current && streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen sharing is not supported on this browser.');
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
        if (localVideoRef.current && streamRef.current) {
          localVideoRef.current.srcObject = streamRef.current;
        }
      };
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen sharing error:', err);
      }
    }
  }, [isScreenSharing]);

  // Safely sync video ref srcObject without flickering
  useEffect(() => {
    if (localVideoRef.current && stream) {
      if (localVideoRef.current.srcObject !== stream) {
        localVideoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  // Run autoStart strictly once on mount, and stopMedia strictly on unmount
  useEffect(() => {
    if (autoStart) {
      startMedia();
    }
    return () => {
      stopMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stream,
    localVideoRef,
    isVideoOff,
    isAudioMuted,
    isScreenSharing,
    isLoading,
    permissionError,
    startMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  };
}
