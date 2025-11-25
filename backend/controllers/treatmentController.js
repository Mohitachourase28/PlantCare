import { getTreatmentsByDisease as _getTreatmentsByDisease } from '../services/treatmentService.js';
const logger = require('pino')();

const getTreatmentsByDisease = async (req, res) => {
  try {
    const { disease } = req.params;
    
    const { disease: diseaseDoc, treatments, note } = await _getTreatmentsByDisease(disease);
    
    // Format response
    const responseTreatments = treatments.map(t => ({
      id: t._id || undefined,
      diseaseId: diseaseDoc?._id || undefined,
      method: t.method,
      steps: t.steps,
      imageUrl: t.imageUrl || undefined,
      approved: t.approved || false,
      ai_generated: t.ai_generated || false
    }));
    
    const response = {
      treatments: responseTreatments
    };
    
    if (note) {
      response.note = note;
    }
    
    res.json(response);
  } catch (error) {
    logger.error('Get treatments error:', error);
    res.status(500).json({
      error: {
        code: 'GET_TREATMENTS_ERROR',
        message: 'Failed to get treatments'
      }
    });
  }
};

export default {
  getTreatmentsByDisease
};