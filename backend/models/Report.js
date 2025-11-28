import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  predictedDisease: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  treatmentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Treatment'
  }],
  aiTreatments: [{
    method: {
      type: String,
      enum: ['organic', 'chemical', 'cultural', 'integrated'],
      required: true
    },
    steps: [{
      type: String,
      required: true
    }],
    imageUrl: String,
    approved: {
      type: Boolean,
      default: false
    },
    ai_generated: {
      type: Boolean,
      default: true
    }
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for id
reportSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
reportSchema.set('toJSON', {
  virtuals: true
});

const Report = model('Report', reportSchema);

export default Report;