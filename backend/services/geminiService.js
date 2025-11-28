import { GoogleGenerativeAI } from '@google/generative-ai';
import { gemini } from '../config/index.js';
const logger = require('pino')();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(gemini.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

const classifyImage = async (imageUrl) => {
  try {
    const prompt = `
    Analyze this plant image and identify the most likely disease or condition.
    
    Return a JSON object with the following structure:
    {
      "disease": "Name of the disease or 'unknown' if not confident",
      "confidence": 0.95, // A value between 0 and 1
      "rationale": "Brief explanation of your diagnosis"
    }
    
    If you cannot identify a specific disease with confidence > 0.5, return "unknown" as the disease.
    Focus on common plant diseases like powdery mildew, early blight, leaf spot, etc.
    `;

    const imageParts = [
      {
        inlineData: {
          data: imageUrl,
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      logger.error('Failed to parse Gemini response as JSON:', parseError);
    }
    
    // Fallback if JSON parsing fails
    return {
      disease: "unknown",
      confidence: 0.1,
      rationale: "Failed to parse AI response"
    };
  } catch (error) {
    logger.error('Gemini classification error:', error);
    return {
      disease: "unknown",
      confidence: 0,
      rationale: "AI service error"
    };
  }
};

const recommendTreatment = async (disease, context = {}) => {
  try {
    const prompt = `
    Provide treatment recommendations for "${disease}" in plants.
    
    Return a JSON object with the following structure:
    {
      "method": "organic", // One of: organic, chemical, cultural, integrated
      "steps": [
        "Step 1: Description",
        "Step 2: Description",
        ...
      ],
      "notes": "Additional notes or precautions"
    }
    
    Guidelines:
    - Prioritize organic and cultural methods when possible
    - Include household-safe options
    - Avoid recommending banned or highly toxic substances
    - Make advice region-agnostic
    - If the disease is "unknown", provide general plant care advice
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      logger.error('Failed to parse Gemini treatment response as JSON:', parseError);
    }
    
    // Fallback if JSON parsing fails
    return {
      method: "cultural",
      steps: [
        "Remove affected parts of the plant",
        "Improve air circulation around the plant",
        "Avoid overhead watering",
        "Monitor the plant regularly for signs of improvement"
      ],
      notes: "Consult with a local plant expert for specific advice"
    };
  } catch (error) {
    logger.error('Gemini treatment recommendation error:', error);
    return {
      method: "cultural",
      steps: [
        "Remove affected parts of the plant",
        "Improve air circulation around the plant",
        "Avoid overhead watering",
        "Monitor the plant regularly for signs of improvement"
      ],
      notes: "AI service error. Consult with a local plant expert for specific advice"
    };
  }
};

const answerPlantCareQuestion = async (message) => {
  try {
    const prompt = `
    Answer this plant care question: "${message}"
    
    Provide helpful, safe advice for plant care.
    If the question is about plant diseases, suggest consulting with a local expert for proper diagnosis.
    Avoid recommending specific chemical products without proper warnings.
    
    Return a JSON object with the following structure:
    {
      "answer": "Your answer here",
      "sources": ["Source 1", "Source 2"] // Optional
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      logger.error('Failed to parse Gemini chat response as JSON:', parseError);
    }
    
    // Fallback if JSON parsing fails
    return {
      answer: "I'm sorry, I couldn't process your question. Please try again or consult with a plant expert.",
      sources: []
    };
  } catch (error) {
    logger.error('Gemini chat error:', error);
    return {
      answer: "I'm experiencing technical difficulties. Please try again later or consult with a plant expert.",
      sources: []
    };
  }
};

export default {
  classifyImage,
  recommendTreatment,
  answerPlantCareQuestion
};