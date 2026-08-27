import { useCallback, useEffect, useRef, useState } from 'react';
import { Player, WSMessage } from '../types/game';
import { sound } from '../utils/audio';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export interface PeerMediaInfo {
  playerId: string;
  stream: MediaStream | null;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  connectionState: RTCPeerConnectionState | 'disconnected' | 'connected';
}

export interface UseWebRTCProps {
  roomCode: string | null;
  currentUserId: string;
  players: Player[];
  sendMessage: (msg: WSMessage) => void;
}

export interface WebRTCHook {
  isInCall: boolean;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  isMirrorMode: boolean;
  localStream: MediaStream | null;
  peers: Record<string, PeerMediaInfo>;
  activeSpeakerId: string | null;
  callLayout: 'floating-pip' | 'grid' | 'compact-bar';
  setCallLayout: (layout: 'floating-pip' | 'grid' | 'compact-bar') => void;
  permissionError: string | null;
  startCall: (withVideo?: boolean) => Promise<boolean>;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  toggleMirrorMode: () => void;
  handleSignalingMessage: (msg: WSMessage) => Promise<void>;
}

export function useWebRTC({ roomCode, currentUserId, players, sendMessage }: UseWebRTCProps): WebRTCHook {
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMirrorMode, setIsMirrorMode] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, PeerMediaInfo>>({});
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [callLayout, setCallLayout] = useState<'floating-pip' | 'grid' | 'compact-bar'>('floating-pip');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // References
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const origVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Cleanup helper
  const cleanupAllPeers = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch (e) {}
    });
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
    setPeers({});
  }, []);

  // Broadcast media states
  const broadcastMediaState = useCallback(
    (audioOn: boolean, videoOn: boolean, screenShare: boolean, inCall: boolean) => {
      if (!roomCode) return;
      sendMessage({
        type: 'MEDIA_STATE_UPDATE',
        payload: {
          roomCode,
          isAudioOn: audioOn,
          isVideoOn: videoOn,
          isScreenSharing: screenShare,
          inCall,
        },
      });
    },
    [roomCode, sendMessage]
  );

  // Audio activity detector for local stream
  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const speaking = avg > 22; // threshold for speaking
        setIsSpeaking(speaking);

        if (speaking) {
          setActiveSpeakerId(currentUserId);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('WebRTC audio analyser init failed:', e);
    }
  }, [currentUserId]);

  // Create Peer Connection
  const createPeerConnection = useCallback(
    (targetUserId: string): RTCPeerConnection => {
      if (peerConnectionsRef.current.has(targetUserId)) {
        return peerConnectionsRef.current.get(targetUserId)!;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && roomCode) {
          sendMessage({
            type: 'WEBRTC_SIGNAL',
            payload: {
              roomCode,
              targetId: targetUserId,
              signal: {
                type: 'ice',
                candidate: event.candidate,
              },
            },
          });
        }
      };

      // Handle Remote Stream Track
      pc.ontrack = (event) => {
        const stream = event.streams[0] || new MediaStream([event.track]);
        remoteStreamsRef.current.set(targetUserId, stream);

        setPeers((prev) => {
          const existing = prev[targetUserId] || {
            playerId: targetUserId,
            stream: null,
            isAudioOn: true,
            isVideoOn: true,
            isScreenSharing: false,
            isSpeaking: false,
            connectionState: 'connected',
          };
          return {
            ...prev,
            [targetUserId]: {
              ...existing,
              stream,
              connectionState: pc.connectionState,
            },
          };
        });
      };

      pc.onconnectionstatechange = () => {
        setPeers((prev) => {
          if (!prev[targetUserId]) return prev;
          return {
            ...prev,
            [targetUserId]: {
              ...prev[targetUserId],
              connectionState: pc.connectionState,
            },
          };
        });
      };

      peerConnectionsRef.current.set(targetUserId, pc);
      return pc;
    },
    [roomCode, sendMessage]
  );

  // Start / Join Call
  const startCall = useCallback(
    async (withVideo = true): Promise<boolean> => {
      setPermissionError(null);
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: withVideo
              ? {
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                  frameRate: { max: 24 },
                  facingMode: 'user',
                }
              : false,
          });
        } catch (mediaErr: any) {
          // If video failed, fallback to audio-only
          console.warn('Video access failed, trying audio-only:', mediaErr);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          setIsVideoOff(true);
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsInCall(true);
        setIsAudioMuted(false);
        setIsVideoOff(!withVideo || stream.getVideoTracks().length === 0);
        sound.playCallJoin();

        setupAudioAnalyser(stream);

        // Notify room that we joined call
        if (roomCode) {
          sendMessage({
            type: 'WEBRTC_JOIN_CALL',
            payload: {
              roomCode,
              isAudioOn: true,
              isVideoOn: stream.getVideoTracks().length > 0,
              isScreenSharing: false,
            },
          });
        }

        // Initialize Peer Connections for all other human players in the room
        players.forEach((p) => {
          if (p.id !== currentUserId && !p.isBot && p.isConnected) {
            const pc = createPeerConnection(p.id);
            // We initiate offer
            pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                if (roomCode) {
                  sendMessage({
                    type: 'WEBRTC_SIGNAL',
                    payload: {
                      roomCode,
                      targetId: p.id,
                      signal: {
                        type: 'offer',
                        sdp: pc.localDescription,
                      },
                    },
                  });
                }
              })
              .catch((err) => console.error('Error creating offer:', err));
          }
        });

        return true;
      } catch (err: any) {
        console.error('Failed to get media devices:', err);
        setPermissionError(
          err.name === 'NotAllowedError'
            ? 'Camera/Microphone permission was denied. Please allow camera and microphone in your browser address bar.'
            : 'No camera or microphone device was found or supported.'
        );
        return false;
      }
    },
    [roomCode, currentUserId, players, sendMessage, setupAudioAnalyser, createPeerConnection]
  );

  // Leave Call
  const leaveCall = useCallback(() => {
    sound.playCallLeave();

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (screenTrackRef.current) {
      try {
        screenTrackRef.current.stop();
      } catch (e) {}
      screenTrackRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    cleanupAllPeers();
    setIsInCall(false);
    setIsScreenSharing(false);
    setIsSpeaking(false);

    if (roomCode) {
      sendMessage({
        type: 'WEBRTC_LEAVE_CALL',
        payload: { roomCode },
      });
    }
  }, [roomCode, sendMessage, cleanupAllPeers]);

  // Toggle Audio (Mute / Unmute)
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      const nextMuted = audioTrack.enabled; // If enabled, it will be disabled (muted)
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(nextMuted);
      sound.playClick();
      broadcastMediaState(!nextMuted, !isVideoOff, isScreenSharing, isInCall);
    }
  }, [isVideoOff, isScreenSharing, isInCall, broadcastMediaState]);

  // Toggle Video (Camera On / Off)
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const nextOff = videoTrack.enabled;
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(nextOff);
      sound.playClick();
      broadcastMediaState(!isAudioMuted, !nextOff, isScreenSharing, isInCall);
    } else {
      // Need to request video track dynamically
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: 24, facingMode: 'user' },
        });
        const newTrack = vStream.getVideoTracks()[0];
        if (newTrack && localStreamRef.current) {
          localStreamRef.current.addTrack(newTrack);
          peerConnectionsRef.current.forEach((pc) => {
            pc.addTrack(newTrack, localStreamRef.current!);
          });
          setIsVideoOff(false);
          sound.playClick();
          broadcastMediaState(!isAudioMuted, true, isScreenSharing, isInCall);
        }
      } catch (e) {
        console.warn('Unable to enable video:', e);
      }
    }
  }, [isAudioMuted, isScreenSharing, isInCall, broadcastMediaState]);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (!isInCall || !localStreamRef.current) return;

    if (isScreenSharing) {
      // Revert to camera
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (origVideoTrackRef.current && localStreamRef.current) {
        const senders: RTCRtpSender[] = [];
        peerConnectionsRef.current.forEach((pc) => {
          senders.push(...pc.getSenders());
        });
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(origVideoTrackRef.current);
        }
        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (currentVideoTrack) {
          localStreamRef.current.removeTrack(currentVideoTrack);
        }
        localStreamRef.current.addTrack(origVideoTrackRef.current);
      }
      setIsScreenSharing(false);
      sound.playClick();
      broadcastMediaState(!isAudioMuted, !isVideoOff, false, isInCall);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        origVideoTrackRef.current = localStreamRef.current.getVideoTracks()[0] || null;

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        // Replace track in peer connections
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          } else {
            pc.addTrack(screenTrack, localStreamRef.current!);
          }
        });

        setIsScreenSharing(true);
        sound.playClick();
        broadcastMediaState(!isAudioMuted, true, true, isInCall);
      } catch (err) {
        console.warn('Screen share canceled or failed:', err);
      }
    }
  }, [isInCall, isScreenSharing, isAudioMuted, isVideoOff, broadcastMediaState]);

  const toggleMirrorMode = useCallback(() => {
    setIsMirrorMode((prev) => !prev);
    sound.playClick();
  }, []);

  // Handle incoming WebSocket WebRTC signaling messages
  const handleSignalingMessage = useCallback(
    async (msg: WSMessage) => {
      const senderId = msg.senderId || msg.payload?.senderId;
      if (!senderId || senderId === currentUserId) return;

      // 1. WEBRTC_JOIN_CALL
      if (msg.type === 'WEBRTC_JOIN_CALL') {
        const payload = msg.payload || {};
        setPeers((prev) => ({
          ...prev,
          [senderId]: {
            playerId: senderId,
            stream: prev[senderId]?.stream || null,
            isAudioOn: payload.isAudioOn ?? true,
            isVideoOn: payload.isVideoOn ?? true,
            isScreenSharing: payload.isScreenSharing ?? false,
            isSpeaking: false,
            connectionState: 'connected',
          },
        }));

        if (isInCall && localStreamRef.current) {
          const pc = createPeerConnection(senderId);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendMessage({
              type: 'WEBRTC_SIGNAL',
              payload: {
                roomCode,
                targetId: senderId,
                signal: {
                  type: 'offer',
                  sdp: pc.localDescription,
                },
              },
            });
          } catch (e) {
            console.error('Failed to create offer on join:', e);
          }
        }
        return;
      }

      // 2. WEBRTC_LEAVE_CALL
      if (msg.type === 'WEBRTC_LEAVE_CALL') {
        if (peerConnectionsRef.current.has(senderId)) {
          try {
            peerConnectionsRef.current.get(senderId)?.close();
          } catch (e) {}
          peerConnectionsRef.current.delete(senderId);
        }
        remoteStreamsRef.current.delete(senderId);
        setPeers((prev) => {
          const updated = { ...prev };
          delete updated[senderId];
          return updated;
        });
        return;
      }

      // 3. MEDIA_STATE_UPDATE
      if (msg.type === 'MEDIA_STATE_UPDATE') {
        const payload = msg.payload || {};
        setPeers((prev) => {
          const existing = prev[senderId] || {
            playerId: senderId,
            stream: null,
            isAudioOn: true,
            isVideoOn: true,
            isScreenSharing: false,
            isSpeaking: false,
            connectionState: 'connected',
          };
          return {
            ...prev,
            [senderId]: {
              ...existing,
              isAudioOn: payload.isAudioOn ?? existing.isAudioOn,
              isVideoOn: payload.isVideoOn ?? existing.isVideoOn,
              isScreenSharing: payload.isScreenSharing ?? existing.isScreenSharing,
            },
          };
        });
        return;
      }

      // 4. WEBRTC_SIGNAL (Offer, Answer, ICE Candidate)
      if (msg.type === 'WEBRTC_SIGNAL') {
        const signal = msg.payload?.signal;
        if (!signal) return;

        let pc = peerConnectionsRef.current.get(senderId);
        if (!pc) {
          pc = createPeerConnection(senderId);
        }

        try {
          if (signal.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendMessage({
              type: 'WEBRTC_SIGNAL',
              payload: {
                roomCode,
                targetId: senderId,
                signal: {
                  type: 'answer',
                  sdp: pc.localDescription,
                },
              },
            });
          } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.type === 'ice' && signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        } catch (err) {
          console.error('Error handling WebRTC signal:', err);
        }
      }
    },
    [currentUserId, isInCall, roomCode, sendMessage, createPeerConnection]
  );

  // Leave call on room change or unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      cleanupAllPeers();
    };
  }, [cleanupAllPeers]);

  return {
    isInCall,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isSpeaking,
    isMirrorMode,
    localStream,
    peers,
    activeSpeakerId,
    callLayout,
    setCallLayout,
    permissionError,
    startCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleMirrorMode,
    handleSignalingMessage,
  };
}
