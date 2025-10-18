import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';
import 'dotenv/config';
const app = express();
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
app.use("/", (req, res) => {
    res.send("Hello World");
});
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import maidRoutes from './routes/maids.js';
import serviceRoutes from './routes/services.js';
import maidAvailabilityRoutes from './routes/maidAvailability.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import reviewRoutes from './routes/reviews.js';
import connectDB from './config/database.js';
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maids', maidRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', maidAvailabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
let isConnected = false;
async function startServer() {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
}
app.use(async (req, res, next) => {
    await startServer();
    next();
});
export default serverless(app);
//# sourceMappingURL=server.js.map