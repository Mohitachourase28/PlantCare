import app from './app.js';
import { connectDatabase } from './config/database.js';
import pino from 'pino';

const logger = pino();
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();