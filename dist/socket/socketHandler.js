import Booking from '../models/Booking.js';
export const activeTimers = new Map();
export function startBookingTimer(io, bookingId, endTime) {
    try {
        const timeLeft = endTime.getTime() - Date.now();
        if (timeLeft <= 0) {
            completeBooking(io, bookingId);
            return;
        }
        const timer = setTimeout(() => {
            completeBooking(io, bookingId);
        }, timeLeft);
        activeTimers.set(bookingId, timer);
        const updateInterval = setInterval(() => {
            try {
                const remaining = Math.max(0, endTime.getTime() - Date.now());
                io.to(`booking-${bookingId}`).emit('timer-update', {
                    bookingId,
                    timeLeft: Math.floor(remaining / 1000),
                    endTime
                });
                if (remaining <= 0) {
                    clearInterval(updateInterval);
                }
            }
            catch (error) {
                console.error('Error in timer update interval:', error);
                clearInterval(updateInterval);
            }
        }, 1000);
        activeTimers.set(`${bookingId}-interval`, updateInterval);
    }
    catch (error) {
        console.error('Error starting booking timer:', error);
    }
}
export async function completeBooking(io, bookingId) {
    try {
        await Booking.findByIdAndUpdate(bookingId, { status: 'completed' });
        io.to(`booking-${bookingId}`).emit('booking-completed', { bookingId });
        const timer = activeTimers.get(bookingId);
        if (timer) {
            clearTimeout(timer);
            activeTimers.delete(bookingId);
        }
        const interval = activeTimers.get(`${bookingId}-interval`);
        if (interval) {
            clearInterval(interval);
            activeTimers.delete(`${bookingId}-interval`);
        }
    }
    catch (error) {
        console.error('Error completing booking:', error);
    }
}
export function extendBookingTimer(io, bookingId, newEndTime) {
    try {
        const existingTimer = activeTimers.get(bookingId);
        if (existingTimer) {
            clearTimeout(existingTimer);
            activeTimers.delete(bookingId);
        }
        const existingInterval = activeTimers.get(`${bookingId}-interval`);
        if (existingInterval) {
            clearInterval(existingInterval);
            activeTimers.delete(`${bookingId}-interval`);
        }
        startBookingTimer(io, bookingId, newEndTime);
    }
    catch (error) {
        console.error('Error extending booking timer:', error);
    }
}
export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        try {
            socket.on('join-booking', (bookingId) => {
                try {
                    socket.join(`booking-${bookingId}`);
                    console.log(`User ${socket.id} joined booking room: ${bookingId}`);
                }
                catch (error) {
                    console.error('Error joining booking room:', error);
                }
            });
            socket.on('leave-booking', (bookingId) => {
                try {
                    socket.leave(`booking-${bookingId}`);
                    console.log(`User ${socket.id} left booking room: ${bookingId}`);
                }
                catch (error) {
                    console.error('Error leaving booking room:', error);
                }
            });
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        }
        catch (error) {
            console.error('Error in socket connection handling:', error);
        }
    });
}
//# sourceMappingURL=socketHandler.js.map