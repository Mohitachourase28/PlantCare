import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  is_super_admin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for id
adminSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', {
  virtuals: true
});

const Admin = model('Admin', adminSchema);

export default Admin;