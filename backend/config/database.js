import { connect } from 'mongoose';
import pino from 'pino';

const logger = pino();

export async function connectDatabase() {
  try {
    const conn = await connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}