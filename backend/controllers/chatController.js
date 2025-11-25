import { answerPlantCareQuestion } from '../services/geminiService';
const logger = require('pino')();

const queryChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: {
          code: 'MISSING_MESSAGE',
          message: 'Message is required'
        }
      });
    }
    
    const response = await answerPlantCareQuestion(message);
    
    res.json({
      answer: response.answer,
      sources: response.sources || []
    });
  } catch (error) {
    logger.error('Chat query error:', error);
    res.status(500).json({
      error: {
        code: 'CHAT_ERROR',
        message: 'Failed to process chat query'
      }
    });
  }
};

export default {
  queryChat
};