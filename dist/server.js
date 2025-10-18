import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use('/uploads', express.static('uploads'));
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import maidRoutes from './routes/maids';
import serviceRoutes from './routes/services';
import maidAvailabilityRoutes from './routes/maidAvailability';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import connectDB from './config/database';
import Booking from './models/Booking';
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maids', maidRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', maidAvailabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-booking', (bookingId) => {
        socket.join(`booking-${bookingId}`);
        console.log(`User ${socket.id} joined booking room: ${bookingId}`);
    });
    socket.on('leave-booking', (bookingId) => {
        socket.leave(`booking-${bookingId}`);
        console.log(`User ${socket.id} left booking room: ${bookingId}`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const activeTimers = new Map();
function startBookingTimer(bookingId, endTime) {
    const timeLeft = endTime.getTime() - Date.now();
    if (timeLeft <= 0) {
        completeBooking(bookingId);
        return;
    }
    const timer = setTimeout(() => {
        completeBooking(bookingId);
    }, timeLeft);
    activeTimers.set(bookingId, timer);
    const updateInterval = setInterval(() => {
        const remaining = Math.max(0, endTime.getTime() - Date.now());
        io.to(`booking-${bookingId}`).emit('timer-update', {
            bookingId,
            timeLeft: Math.floor(remaining / 1000),
            endTime
        });
        if (remaining <= 0) {
            clearInterval(updateInterval);
        }
    }, 1000);
    activeTimers.set(`${bookingId}-interval`, updateInterval);
}
async function completeBooking(bookingId) {
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
function extendBookingTimer(bookingId, newEndTime) {
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
    startBookingTimer(bookingId, newEndTime);
}
export { io, startBookingTimer, extendBookingTimer };
async function startServer() {
    try {
        await connectDB();
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error(' Failed to start server:', error.message);
        console.log('\n Try running: npm run setup-db');
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map