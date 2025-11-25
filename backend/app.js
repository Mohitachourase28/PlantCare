import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import expressPino from 'express-pino-logger';

// import { cors as _cors } from './config/cors.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.js';
import predictRoutes from './routes/predict.js';
import treatmentRoutes from './routes/treatments.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js';
import chatRoutes from './routes/chat.js';
import cors from "cors";
import { corsOptions } from "./config/cors.js";
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));
app.use(expressLogger);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(globalLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/predict', predictRoutes);
app.use('/treatments', treatmentRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;