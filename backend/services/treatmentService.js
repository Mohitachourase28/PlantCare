import Disease, { findOne } from '../models/Disease.js';
import Treatment, { find, findByIdAndUpdate, findByIdAndDelete } from '../models/Treatment.js';
import { recommendTreatment } from './geminiService.js';
const logger = require('pino')();

const getTreatmentsByDisease = async (diseaseName) => {
  try {
    // Find disease by name (case-insensitive)
    let disease = await findOne({
      name: { $regex: new RegExp(`^${diseaseName}$`, 'i') }
    });
    
    // If disease doesn't exist, create it
    if (!disease && diseaseName !== 'unknown') {
      disease = new Disease({
        name: diseaseName,
        description: `Information about ${diseaseName}`,
        symptoms: []
      });
      await disease.save();
    }
    
    // If disease is unknown, return empty treatments
    if (!disease || diseaseName === 'unknown') {
      return {
        disease: null,
        treatments: [],
        note: "No curated treatment found; consider consulting an expert."
      };
    }
    
    // Find approved treatments for this disease
    const treatments = await find({
      diseaseId: disease._id,
      approved: true
    });
    
    // If no approved treatments, generate AI recommendations
    if (treatments.length === 0) {
      const aiRecommendation = await recommendTreatment(disease.name);
      
      return {
        disease,
        treatments: [{
          method: aiRecommendation.method,
          steps: aiRecommendation.steps,
          approved: false,
          ai_generated: true
        }],
        note: "AI-generated treatment. Please verify with a plant expert."
      };
    }
    
    return {
      disease,
      treatments,
      note: null
    };
  } catch (error) {
    logger.error('Error getting treatments:', error);
    throw error;
  }
};

const createTreatment = async (treatmentData) => {
  try {
    const { diseaseId, method, steps, imageUrl, approved } = treatmentData;
    
    // Create new treatment
    const treatment = new Treatment({
      diseaseId,
      method,
      steps,
      imageUrl,
      approved: approved || false
    });
    
    await treatment.save();
    
    return treatment;
  } catch (error) {
    logger.error('Error creating treatment:', error);
    throw error;
  }
};

const updateTreatment = async (treatmentId, updateData) => {
  try {
    const treatment = await findByIdAndUpdate(
      treatmentId,
      updateData,
      { new: true }
    );
    
    if (!treatment) {
      throw new Error('Treatment not found');
    }
    
    return treatment;
  } catch (error) {
    logger.error('Error updating treatment:', error);
    throw error;
  }
};

const deleteTreatment = async (treatmentId) => {
  try {
    const treatment = await findByIdAndDelete(treatmentId);
    
    if (!treatment) {
      throw new Error('Treatment not found');
    }
    
    return treatment;
  } catch (error) {
    logger.error('Error deleting treatment:', error);
    throw error;
  }
};

const getAllTreatments = async (filters = {}) => {
  try {
    const { diseaseId, approved, method } = filters;
    
    const query = {};
    
    if (diseaseId) {
      query.diseaseId = diseaseId;
    }
    
    if (approved !== undefined) {
      query.approved = approved === 'true';
    }
    
    if (method) {
      query.method = method;
    }
    
    const treatments = await find(query)
      .populate('diseaseId', 'name')
      .sort({ createdAt: -1 });
    
    return treatments;
  } catch (error) {
    logger.error('Error getting all treatments:', error);
    throw error;
  }
};

export default {
  getTreatmentsByDisease,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  getAllTreatments
};