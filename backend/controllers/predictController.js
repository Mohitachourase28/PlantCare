import Report from '../models/Report.js';
import Disease, { findOne } from '../models/Disease.js';
import { find } from '../models/Treatment.js';
import { classifyImage, recommendTreatment } from '../services/geminiService.js';
import treatmentService from '../services/treatmentService.js';
const logger = require('pino')();

const predictImage = async (req, res) => {
  try {
    const { public_id, secure_url } = req.cloudinaryResult;
    
    // Classify image using Gemini
    const classification = await classifyImage(secure_url);
    
    // Find or create disease
    let disease = await findOne({
      name: { $regex: new RegExp(`^${classification.disease}$`, 'i') }
    });
    
    if (!disease && classification.disease !== 'unknown') {
      disease = new Disease({
        name: classification.disease,
        description: `Information about ${classification.disease}`,
        symptoms: []
      });
      await disease.save();
    }
    
    // Get treatments for the disease
    let treatments = [];
    let aiTreatments = [];
    
    if (disease) {
      // Find approved treatments
      treatments = await find({
        diseaseId: disease._id,
        approved: true
      });
      
      // If no approved treatments, generate AI recommendations
      if (treatments.length === 0) {
        const aiRecommendation = await recommendTreatment(disease.name);
        
        aiTreatments.push({
          method: aiRecommendation.method,
          steps: aiRecommendation.steps,
          approved: false,
          ai_generated: true
        });
      }
    }
    
    // Create report
    const report = new Report({
      userId: req.user._id,
      imageUrl: secure_url,
      cloudinaryPublicId: public_id,
      predictedDisease: classification.disease,
      confidence: classification.confidence,
      treatmentIds: treatments.map(t => t._id),
      aiTreatments
    });
    
    await report.save();
    
    // Populate treatment details
    await report.populate('treatmentIds');
    
    // Format response
    const responseTreatments = [
      ...report.treatmentIds.map(t => ({
        id: t._id,
        diseaseId: t.diseaseId,
        method: t.method,
        steps: t.steps,
        imageUrl: t.imageUrl,
        approved: t.approved,
        ai_generated: false
      })),
      ...report.aiTreatments
    ];
    
    res.status(201).json({
      reportId: report._id,
      disease: report.predictedDisease,
      confidence: report.confidence,
      imageUrl: report.imageUrl,
      treatments: responseTreatments
    });
  } catch (error) {
    logger.error('Image prediction error:', error);
    res.status(500).json({
      error: {
        code: 'PREDICTION_ERROR',
        message: 'Failed to process image'
      }
    });
  }
};

const predictBatch = async (req, res) => {
  try {
    const results = [];
    
    for (const cloudinaryResult of req.cloudinaryResults) {
      try {
        const { public_id, secure_url } = cloudinaryResult;
        
        // Classify image using Gemini
        const classification = await classifyImage(secure_url);
        
        // Find or create disease
        let disease = await findOne({
          name: { $regex: new RegExp(`^${classification.disease}$`, 'i') }
        });
        
        if (!disease && classification.disease !== 'unknown') {
          disease = new Disease({
            name: classification.disease,
            description: `Information about ${classification.disease}`,
            symptoms: []
          });
          await disease.save();
        }
        
        // Get treatments for the disease
        let treatments = [];
        let aiTreatments = [];
        
        if (disease) {
          // Find approved treatments
          treatments = await find({
            diseaseId: disease._id,
            approved: true
          });
          
          // If no approved treatments, generate AI recommendations
          if (treatments.length === 0) {
            const aiRecommendation = await recommendTreatment(disease.name);
            
            aiTreatments.push({
              method: aiRecommendation.method,
              steps: aiRecommendation.steps,
              approved: false,
              ai_generated: true
            });
          }
        }
        
        // Create report
        const report = new Report({
          userId: req.user._id,
          imageUrl: secure_url,
          cloudinaryPublicId: public_id,
          predictedDisease: classification.disease,
          confidence: classification.confidence,
          treatmentIds: treatments.map(t => t._id),
          aiTreatments
        });
        
        await report.save();
        
        // Populate treatment details
        await report.populate('treatmentIds');
        
        // Format response
        const responseTreatments = [
          ...report.treatmentIds.map(t => ({
            id: t._id,
            diseaseId: t.diseaseId,
            method: t.method,
            steps: t.steps,
            imageUrl: t.imageUrl,
            approved: t.approved,
            ai_generated: false
          })),
          ...report.aiTreatments
        ];
        
        results.push({
          success: true,
          reportId: report._id,
          disease: report.predictedDisease,
          confidence: report.confidence,
          imageUrl: report.imageUrl,
          treatments: responseTreatments
        });
      } catch (error) {
        logger.error('Batch prediction item error:', error);
        results.push({
          success: false,
          error: {
            code: 'PREDICTION_ERROR',
            message: 'Failed to process image'
          }
        });
      }
    }
    
    res.status(201).json({ results });
  } catch (error) {
    logger.error('Batch prediction error:', error);
    res.status(500).json({
      error: {
        code: 'BATCH_PREDICTION_ERROR',
        message: 'Failed to process images'
      }
    });
  }
};

export default {
  predictImage,
  predictBatch
};