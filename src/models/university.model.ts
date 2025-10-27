import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  domain: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>({
  name: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'universities'
});

// Create indexes
UniversitySchema.index({ name: 1 });
UniversitySchema.index({ domain: 1 });
UniversitySchema.index({ country: 1 });

const University = mongoose.model<IUniversity>('University', UniversitySchema);

export default University;
