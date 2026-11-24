import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ [EventPulse] Socket client connected: ${socket.id}`);

    // Join role-specific rooms
    socket.on('join_role', (role: string) => {
      socket.join(`role:${role}`);
      console.log(`Client ${socket.id} joined room role:${role}`);
    });

    // Join event-specific room for real-time seat availability & check-ins
    socket.on('join_event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`Client ${socket.id} listening to live updates for event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [EventPulse] Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => io;

// Real-Time Broadcast: Ticket Booked (Instantly decrements seat count across screens)
export const broadcastTicketBooked = (bookingData: any) => {
  if (io) {
    io.emit('ticket:booked', {
      eventId: bookingData.eventId,
      ticketCount: bookingData.ticketCount,
      tierBreakdown: bookingData.tierBreakdown,
      bookingNumber: bookingData.bookingNumber,
    });
    console.log(`📢 [Socket] Broadcasted new booking #${bookingData.bookingNumber} (${bookingData.ticketCount} seats)`);
  }
};

// Real-Time Broadcast: Check-In Verified (Instantly increments attendance count on gate & dashboard)
export const broadcastCheckInVerified = (checkInData: any) => {
  if (io) {
    io.to('role:organizer').to('role:admin').emit('checkin:verified', checkInData);
    io.emit('attendance:increment', {
      eventId: checkInData.eventId,
      attendeeName: checkInData.attendeeName,
      tierName: checkInData.tierName,
      status: checkInData.status,
      timestamp: checkInData.verifiedAt,
    });
    console.log(`📢 [Socket] Broadcasted check-in event for ticket: ${checkInData.ticketCode} (${checkInData.status})`);
  }
};

// Real-Time Broadcast: New Event Published
export const broadcastEventPublished = (event: any) => {
  if (io) {
    io.emit('event:published', event);
    console.log(`📢 [Socket] Broadcasted newly published event: ${event.title}`);
  }
};
