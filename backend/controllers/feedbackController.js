import { findOne } from '../models/Report.js';
import Feedback, { findOne as _findOne } from '../models/Feedback.js';
const logger = require('pino')();

const submitFeedback = async (req, res) => {
  try {
    const { reportId, is_correct, notes } = req.body;
    
    // Check if report exists and belongs to user
    const report = await findOne({
      _id: reportId,
      userId: req.user._id
    });
    
    if (!report) {
      return res.status(404).json({
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }
    
    // Check if feedback already exists for this report
    const existingFeedback = await _findOne({
      reportId,
      userId: req.user._id
    });
    
    if (existingFeedback) {
      return res.status(409).json({
        error: {
          code: 'FEEDBACK_EXISTS',
          message: 'Feedback already submitted for this report'
        }
      });
    }
    
    // Create feedback
    const feedback = new Feedback({
      reportId,
      userId: req.user._id,
      is_correct,
      notes
    });
    
    await feedback.save();
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    logger.error('Submit feedback error:', error);
    res.status(500).json({
      error: {
        code: 'SUBMIT_FEEDBACK_ERROR',
        message: 'Failed to submit feedback'
      }
    });
  }
};

export default {
  submitFeedback
};