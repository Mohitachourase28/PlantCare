import { Schema, model } from 'mongoose';

const diseaseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for id
diseaseSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
diseaseSchema.set('toJSON', {
  virtuals: true
});

const Disease = model('Disease', diseaseSchema);

export default Disease;