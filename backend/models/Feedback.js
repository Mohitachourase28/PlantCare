import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_correct: {
    type: Boolean,
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for id
feedbackSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
feedbackSchema.set('toJSON', {
  virtuals: true
});

const Feedback = model('Feedback', feedbackSchema);

export default Feedback;