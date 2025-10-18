import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import serverless from 'serverless-http';
import 'dotenv/config';
import { setupSocketHandlers, startBookingTimer, extendBookingTimer } from './socket/socketHandler';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';


const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // In production, specify your frontend URL
//     methods: ["GET", "POST"]
//   }
// });

// Setup socket handlers
// setupSocketHandlers(io);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Static uploads folder
app.use('/uploads', express.static('uploads'));

app.use("/",(req,res)=>{
  res.send("Hello World")
})
// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import maidRoutes from './routes/maids';
import serviceRoutes from './routes/services';
import maidAvailabilityRoutes from './routes/maidAvailability';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import connectDB from './config/database';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maids', maidRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', maidAvailabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Export functions for use in controllers
// export { io, startBookingTimer, extendBookingTimer };

// Initialize database and start server
// async function startServer() {
//   try {
//     // Connect to database
//     await connectDB();
//     // console.log(' Database connection established');

//     // const PORT = process.env.PORT || 5000;
//     // server.listen(PORT, () => {
//     //   console.log(`Server running on port ${PORT}`);
//     //   // console.log(`API Base URL: http://localhost:${PORT}/api`);
//     // });

//   } catch (error) {
//     console.error(' Failed to start server:', (error as Error).message);
//     console.log('\n Try running: npm run setup-db');
//     process.exit(1);
//   }
// }

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

// ✅ Instead of exporting `app` directly, export serverless handler
export default serverless(app);

