import { useCallback, useEffect, useRef, useState } from 'react';
import { Player, WSMessage } from '../types/game';
import { sound } from '../utils/audio';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export interface PeerMediaInfo {
  playerId: string;
  stream: MediaStream | null;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  connectionState: RTCPeerConnectionState | 'disconnected' | 'connected' | 'connecting';
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
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const isInCallRef = useRef<boolean>(false);
  const roomCodeRef = useRef<string | null>(roomCode);
  const playersRef = useRef<Player[]>(players);

  // Audio Contexts & Analysers
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const remoteAudioIntervalsRef = useRef<Map<string, any>>(new Map());
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const origVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Keep refs in sync
  useEffect(() => {
    isInCallRef.current = isInCall;
  }, [isInCall]);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // Clean up all peer connections & streams
  const cleanupAllPeers = useCallback(() => {
    remoteAudioIntervalsRef.current.forEach((interval) => clearInterval(interval));
    remoteAudioIntervalsRef.current.clear();

    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch (e) {}
    });
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
    pendingIceCandidatesRef.current.clear();
    makingOfferRef.current.clear();
    setPeers({});
  }, []);

  // Broadcast media states
  const broadcastMediaState = useCallback(
    (audioOn: boolean, videoOn: boolean, screenShare: boolean, inCall: boolean) => {
      const code = roomCodeRef.current;
      if (!code) return;
      sendMessage({
        type: 'MEDIA_STATE_UPDATE',
        payload: {
          roomCode: code,
          isAudioOn: audioOn,
          isVideoOn: videoOn,
          isScreenSharing: screenShare,
          inCall,
        },
      });
    },
    [sendMessage]
  );

  // Setup local audio analyzer for voice activity detection
  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
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
        const speaking = avg > 20;
        setIsSpeaking(speaking);

        if (speaking) {
          setActiveSpeakerId(currentUserId);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('[WebRTC] Local audio analyser failed:', e);
    }
  }, [currentUserId]);

  // Setup remote audio analyzer for voice activity detection
  const setupRemoteAudioAnalyser = useCallback((targetUserId: string, stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      if (remoteAudioIntervalsRef.current.has(targetUserId)) {
        clearInterval(remoteAudioIntervalsRef.current.get(targetUserId));
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const interval = setInterval(() => {
        if (!remoteStreamsRef.current.has(targetUserId)) {
          clearInterval(interval);
          try {
            ctx.close();
          } catch (e) {}
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const speaking = avg > 20;

        setPeers((prev) => {
          if (!prev[targetUserId] || prev[targetUserId].isSpeaking === speaking) return prev;
          return {
            ...prev,
            [targetUserId]: {
              ...prev[targetUserId],
              isSpeaking: speaking,
            },
          };
        });

        if (speaking) {
          setActiveSpeakerId(targetUserId);
        }
      }, 150);

      remoteAudioIntervalsRef.current.set(targetUserId, interval);
    } catch (e) {
      console.warn('[WebRTC] Remote audio analyser error:', e);
    }
  }, []);

  // Helper to create or get an RTCPeerConnection for a target peer
  const getOrCreatePeerConnection = useCallback(
    (targetUserId: string): RTCPeerConnection => {
      if (peerConnectionsRef.current.has(targetUserId)) {
        return peerConnectionsRef.current.get(targetUserId)!;
      }

      console.log(`[WebRTC] Creating new RTCPeerConnection for ${targetUserId}`);
      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,
      });

      // 1. Add existing local stream tracks to this PC
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, localStreamRef.current!);
          } catch (e) {
            console.warn('[WebRTC] Error adding local track to PC:', e);
          }
        });
      }

      // 2. Handle ICE Candidate generation
      pc.onicecandidate = (event) => {
        const code = roomCodeRef.current;
        if (event.candidate && code) {
          sendMessage({
            type: 'WEBRTC_SIGNAL',
            payload: {
              roomCode: code,
              targetId: targetUserId,
              signal: {
                type: 'ice',
                candidate: event.candidate.toJSON(),
              },
            },
          });
        }
      };

      // 3. Handle incoming remote tracks
      pc.ontrack = (event) => {
        console.log(`[WebRTC] ontrack from peer ${targetUserId}:`, event.track.kind);
        let stream = remoteStreamsRef.current.get(targetUserId);
        if (!stream) {
          stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream();
        }

        // Add track if not already in stream
        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track);
        }

        // Recreate stream wrapper so React state recognizes the update
        const updatedStream = new MediaStream(stream.getTracks());
        remoteStreamsRef.current.set(targetUserId, updatedStream);

        const hasVideo = updatedStream.getVideoTracks().some((t) => t.enabled);
        const hasAudio = updatedStream.getAudioTracks().some((t) => t.enabled);

        setPeers((prev) => {
          const existing = prev[targetUserId];
          return {
            ...prev,
            [targetUserId]: {
              playerId: targetUserId,
              stream: updatedStream,
              isAudioOn: hasAudio,
              isVideoOn: hasVideo,
              isScreenSharing: existing?.isScreenSharing || false,
              isSpeaking: false,
              connectionState: pc.connectionState,
            },
          };
        });

        if (event.track.kind === 'audio') {
          setupRemoteAudioAnalyser(targetUserId, updatedStream);
        }
      };

      // 4. Connection state monitoring
      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state with ${targetUserId}:`, pc.connectionState);
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

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE connection state with ${targetUserId}:`, pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed') {
          try {
            pc.restartIce();
          } catch (e) {}
        }
      };

      peerConnectionsRef.current.set(targetUserId, pc);
      return pc;
    },
    [sendMessage, setupRemoteAudioAnalyser]
  );

  // Send Offer helper
  const initiateOfferToPeer = useCallback(
    async (targetUserId: string) => {
      const code = roomCodeRef.current;
      if (!code) return;

      try {
        const pc = getOrCreatePeerConnection(targetUserId);
        makingOfferRef.current.set(targetUserId, true);

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        if (pc.signalingState !== 'stable') {
          console.warn('[WebRTC] Skipping offer creation, signaling state is not stable:', pc.signalingState);
          return;
        }

        await pc.setLocalDescription(offer);

        sendMessage({
          type: 'WEBRTC_SIGNAL',
          payload: {
            roomCode: code,
            targetId: targetUserId,
            signal: {
              type: 'offer',
              sdp: pc.localDescription,
            },
          },
        });
      } catch (err) {
        console.error(`[WebRTC] Error initiating offer to ${targetUserId}:`, err);
      } finally {
        makingOfferRef.current.set(targetUserId, false);
      }
    },
    [getOrCreatePeerConnection, sendMessage]
  );

  // Start / Join Call
  const startCall = useCallback(
    async (withVideo = true): Promise<boolean> => {
      setPermissionError(null);
      const code = roomCodeRef.current;

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
          console.warn('[WebRTC] Video stream failed, attempting audio-only:', mediaErr);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
          setIsVideoOff(true);
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsInCall(true);
        isInCallRef.current = true;
        setIsAudioMuted(false);
        setIsVideoOff(!withVideo || stream.getVideoTracks().length === 0);
        sound.playCallJoin();

        setupAudioAnalyser(stream);

        // Notify room that we joined call
        if (code) {
          sendMessage({
            type: 'WEBRTC_JOIN_CALL',
            payload: {
              roomCode: code,
              isAudioOn: true,
              isVideoOn: stream.getVideoTracks().length > 0,
              isScreenSharing: false,
            },
          });
        }

        // Initialize Peer Connections and initiate offers to all human peers in the room
        const currentPlayers = playersRef.current;
        currentPlayers.forEach((p) => {
          if (p.id !== currentUserId && !p.isBot && p.isConnected) {
            initiateOfferToPeer(p.id);
          }
        });

        return true;
      } catch (err: any) {
        console.error('[WebRTC] Media access failed:', err);
        setPermissionError(
          err.name === 'NotAllowedError'
            ? 'Camera / Microphone permission denied. Please allow device access in your browser.'
            : 'No camera or microphone found on your device.'
        );
        return false;
      }
    },
    [currentUserId, sendMessage, setupAudioAnalyser, initiateOfferToPeer]
  );

  // Leave Call
  const leaveCall = useCallback(() => {
    sound.playCallLeave();
    const code = roomCodeRef.current;

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
    isInCallRef.current = false;
    setIsScreenSharing(false);
    setIsSpeaking(false);

    if (code) {
      sendMessage({
        type: 'WEBRTC_LEAVE_CALL',
        payload: { roomCode: code },
      });
    }
  }, [sendMessage, cleanupAllPeers]);

  // Toggle Audio (Mute / Unmute)
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      const nextMuted = audioTrack.enabled;
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
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: 24, facingMode: 'user' },
        });
        const newTrack = vStream.getVideoTracks()[0];
        if (newTrack && localStreamRef.current) {
          localStreamRef.current.addTrack(newTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

          peerConnectionsRef.current.forEach((pc, targetId) => {
            pc.addTrack(newTrack, localStreamRef.current!);
            initiateOfferToPeer(targetId);
          });

          setIsVideoOff(false);
          sound.playClick();
          broadcastMediaState(!isAudioMuted, true, isScreenSharing, isInCall);
        }
      } catch (e) {
        console.warn('[WebRTC] Unable to request video track:', e);
      }
    }
  }, [isAudioMuted, isScreenSharing, isInCall, broadcastMediaState, initiateOfferToPeer]);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (!isInCall || !localStreamRef.current) return;

    if (isScreenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (origVideoTrackRef.current && localStreamRef.current) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && origVideoTrackRef.current) {
            sender.replaceTrack(origVideoTrackRef.current);
          }
        });
        const curr = localStreamRef.current.getVideoTracks()[0];
        if (curr) localStreamRef.current.removeTrack(curr);
        localStreamRef.current.addTrack(origVideoTrackRef.current);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
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
        console.warn('[WebRTC] Screen share failed or canceled:', err);
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
      const code = roomCodeRef.current;

      // 1. Peer joined call
      if (msg.type === 'WEBRTC_JOIN_CALL') {
        const payload = msg.payload || {};
        console.log(`[WebRTC] Peer ${senderId} joined the call`);

        setPeers((prev) => ({
          ...prev,
          [senderId]: {
            playerId: senderId,
            stream: prev[senderId]?.stream || null,
            isAudioOn: payload.isAudioOn ?? true,
            isVideoOn: payload.isVideoOn ?? true,
            isScreenSharing: payload.isScreenSharing ?? false,
            isSpeaking: false,
            connectionState: 'connecting',
          },
        }));

        // If we are currently in call, initiate offer to the new joiner
        if (isInCallRef.current && localStreamRef.current) {
          initiateOfferToPeer(senderId);
        }
        return;
      }

      // 2. Peer left call
      if (msg.type === 'WEBRTC_LEAVE_CALL') {
        console.log(`[WebRTC] Peer ${senderId} left call`);
        if (peerConnectionsRef.current.has(senderId)) {
          try {
            peerConnectionsRef.current.get(senderId)?.close();
          } catch (e) {}
          peerConnectionsRef.current.delete(senderId);
        }
        remoteStreamsRef.current.delete(senderId);
        pendingIceCandidatesRef.current.delete(senderId);

        if (remoteAudioIntervalsRef.current.has(senderId)) {
          clearInterval(remoteAudioIntervalsRef.current.get(senderId));
          remoteAudioIntervalsRef.current.delete(senderId);
        }

        setPeers((prev) => {
          const updated = { ...prev };
          delete updated[senderId];
          return updated;
        });
        return;
      }

      // 3. Media State Update (Mute/Video toggle)
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

      // 4. WebRTC Signal (Offer, Answer, ICE Candidate)
      if (msg.type === 'WEBRTC_SIGNAL') {
        const signal = msg.payload?.signal;
        if (!signal) return;

        const pc = getOrCreatePeerConnection(senderId);

        try {
          if (signal.type === 'offer') {
            const isPolite = currentUserId > senderId;
            const offerCollision = pc.signalingState !== 'stable' || makingOfferRef.current.get(senderId);

            if (offerCollision && !isPolite) {
              console.log(`[WebRTC] Impolite peer ignoring offer collision from ${senderId}`);
              return;
            }

            if (offerCollision && isPolite) {
              console.log(`[WebRTC] Polite peer rolling back for incoming offer from ${senderId}`);
              await pc.setLocalDescription({ type: 'rollback' } as any);
            }

            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

            // Drain queued ICE candidates
            const queuedIce = pendingIceCandidatesRef.current.get(senderId) || [];
            for (const candidate of queuedIce) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.warn('[WebRTC] Error adding queued ICE:', err);
              }
            }
            pendingIceCandidatesRef.current.set(senderId, []);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendMessage({
              type: 'WEBRTC_SIGNAL',
              payload: {
                roomCode: code,
                targetId: senderId,
                signal: {
                  type: 'answer',
                  sdp: pc.localDescription,
                },
              },
            });
          } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

            // Drain queued ICE candidates
            const queuedIce = pendingIceCandidatesRef.current.get(senderId) || [];
            for (const candidate of queuedIce) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.warn('[WebRTC] Error adding queued ICE on answer:', err);
              }
            }
            pendingIceCandidatesRef.current.set(senderId, []);
          } else if (signal.type === 'ice' && signal.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              } catch (err) {
                console.warn('[WebRTC] Failed to add ICE candidate directly:', err);
              }
            } else {
              // Queue candidate until remote description is set
              if (!pendingIceCandidatesRef.current.has(senderId)) {
                pendingIceCandidatesRef.current.set(senderId, []);
              }
              pendingIceCandidatesRef.current.get(senderId)!.push(signal.candidate);
            }
          }
        } catch (err) {
          console.error(`[WebRTC] Error processing signal from ${senderId}:`, err);
        }
      }
    },
    [currentUserId, getOrCreatePeerConnection, initiateOfferToPeer, sendMessage]
  );

  // Clean up on unmount
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
