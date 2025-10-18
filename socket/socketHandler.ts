import { Server } from 'socket.io';
import Booking from '../models/Booking.js';

export const activeTimers = new Map<string, NodeJS.Timeout>();

// Function to start timer for a booking
export function startBookingTimer(io: Server, bookingId: string, endTime: Date) {
  try {
    const timeLeft = endTime.getTime() - Date.now();

    if (timeLeft <= 0) {
      // Timer already expired
      completeBooking(io, bookingId);
      return;
    }

    const timer = setTimeout(() => {
      completeBooking(io, bookingId);
    }, timeLeft);

    activeTimers.set(bookingId, timer);

    // Send real-time updates every second
    const updateInterval = setInterval(() => {
      try {
        const remaining = Math.max(0, endTime.getTime() - Date.now());
        io.to(`booking-${bookingId}`).emit('timer-update', {
          bookingId,
          timeLeft: Math.floor(remaining / 1000), // seconds
          endTime
        });

        if (remaining <= 0) {
          clearInterval(updateInterval);
        }
      } catch (error) {
        console.error('Error in timer update interval:', error);
        clearInterval(updateInterval);
      }
    }, 1000);

    // Store interval ID for cleanup
    activeTimers.set(`${bookingId}-interval`, updateInterval as any);
  } catch (error) {
    console.error('Error starting booking timer:', error);
  }
}

// Function to complete booking
export async function completeBooking(io: Server, bookingId: string) {
  try {
    await Booking.findByIdAndUpdate(bookingId, { status: 'completed' });
    io.to(`booking-${bookingId}`).emit('booking-completed', { bookingId });

    // Clean up timers
    const timer = activeTimers.get(bookingId);
    if (timer) {
      clearTimeout(timer);
      activeTimers.delete(bookingId);
    }

    const interval = activeTimers.get(`${bookingId}-interval`);
    if (interval) {
      clearInterval(interval as any);
      activeTimers.delete(`${bookingId}-interval`);
    }
  } catch (error) {
    console.error('Error completing booking:', error);
  }
}

// Function to extend timer
export function extendBookingTimer(io: Server, bookingId: string, newEndTime: Date) {
  try {
    // Clear existing timer
    const existingTimer = activeTimers.get(bookingId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      activeTimers.delete(bookingId);
    }

    const existingInterval = activeTimers.get(`${bookingId}-interval`);
    if (existingInterval) {
      clearInterval(existingInterval as any);
      activeTimers.delete(`${bookingId}-interval`);
    }

    // Start new timer
    startBookingTimer(io, bookingId, newEndTime);
  } catch (error) {
    console.error('Error extending booking timer:', error);
  }
}

// Socket.io connection handling
export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    try {
      // Join booking room
      socket.on('join-booking', (bookingId: string) => {
        try {
          socket.join(`booking-${bookingId}`);
          console.log(`User ${socket.id} joined booking room: ${bookingId}`);
        } catch (error) {
          console.error('Error joining booking room:', error);
        }
      });

      // Leave booking room
      socket.on('leave-booking', (bookingId: string) => {
        try {
          socket.leave(`booking-${bookingId}`);
          console.log(`User ${socket.id} left booking room: ${bookingId}`);
        } catch (error) {
          console.error('Error leaving booking room:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    } catch (error) {
      console.error('Error in socket connection handling:', error);
    }
  });
}