import { Schema, model } from 'mongoose';

const treatmentSchema = new Schema({
  diseaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Disease',
    required: true
  },
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
  }
}, {
  timestamps: true
});

// Virtual for id
treatmentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
treatmentSchema.set('toJSON', {
  virtuals: true
});

const Treatment = model('Treatment', treatmentSchema);

export default Treatment;