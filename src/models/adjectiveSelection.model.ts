import mongoose, { Schema, Document } from 'mongoose';

export interface IAdjectiveSelection extends Document {
  userId: string;
  targetUserId: string;
  adjective: string;
  timestamp: Date;
  isMatched: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdjectiveSelectionSchema = new Schema<IAdjectiveSelection>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  targetUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  adjective: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isMatched: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'adjective_selections'
});

const AdjectiveSelection = mongoose.model<IAdjectiveSelection>('AdjectiveSelection', AdjectiveSelectionSchema);

export default AdjectiveSelection;