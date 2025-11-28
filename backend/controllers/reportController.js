import { find, countDocuments, findOne, findByIdAndDelete } from '../models/Report.js';
import { getPagination } from '../utils/pagination.js';
const logger = require('pino')();

const getUserReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);
    
    const reports = await find({
      userId: req.user._id,
      deleted: false
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(parsedLimit)
      .populate('treatmentIds');
    
    const total = await countDocuments({
      userId: req.user._id,
      deleted: false
    });
    
    res.json({
      data: reports,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    logger.error('Get user reports error:', error);
    res.status(500).json({
      error: {
        code: 'GET_REPORTS_ERROR',
        message: 'Failed to get reports'
      }
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await findOne({
      _id: id,
      userId: req.user._id,
      deleted: false
    })
      .populate('treatmentIds');
    
    if (!report) {
      return res.status(404).json({
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }
    
    res.json({
      data: report
    });
  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({
      error: {
        code: 'GET_REPORT_ERROR',
        message: 'Failed to get report'
      }
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await findOne({
      _id: id,
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
    
    // Hard delete
    await findByIdAndDelete(id);
    
    res.json({
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({
      error: {
        code: 'DELETE_REPORT_ERROR',
        message: 'Failed to delete report'
      }
    });
  }
};

export default {
  getUserReports,
  getReportById,
  deleteReport
};