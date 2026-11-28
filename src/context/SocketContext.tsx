import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinEvent: (eventId: string) => void;
  lastEvent: { type: string; payload: any } | null;
  lastCheckIn?: any;
  playScanSound: (status: 'verified' | 'already_checked_in' | 'invalid') => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: string; payload: any } | null>(null);

  useEffect(() => {
    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to EventPulse WebSocket server:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('join_role', role);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from EventPulse WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('ticket:booked', (data) => {
      console.log('📢 Real-time event: ticket:booked', data);
      setLastEvent({ type: 'ticket:booked', payload: data });
    });

    newSocket.on('checkin:verified', (data) => {
      console.log('📢 Real-time event: checkin:verified', data);
      setLastEvent({ type: 'checkin:verified', payload: data });
    });

    newSocket.on('attendance:increment', (data) => {
      setLastEvent({ type: 'attendance:increment', payload: data });
    });

    newSocket.on('event:published', (data) => {
      setLastEvent({ type: 'event:published', payload: data });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join_role', role);
    }
  }, [role, socket, isConnected]);

  const joinEvent = (eventId: string) => {
    if (socket && isConnected) {
      socket.emit('join_event', eventId);
    }
  };

  const playScanSound = (status: 'verified' | 'already_checked_in' | 'invalid') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (status === 'verified') {
        // High pleasant double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        // Low buzzer warning sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const lastCheckIn = lastEvent?.type === 'checkin:verified' ? lastEvent.payload : null;

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinEvent, lastEvent, lastCheckIn, playScanSound }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
