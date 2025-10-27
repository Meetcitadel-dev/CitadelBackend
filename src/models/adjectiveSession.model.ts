import mongoose, { Schema, Document } from 'mongoose';

export interface IAdjectiveSession extends Document {
  userId: string;
  targetUserId: string;
  sessionId: string;
  adjectives: string[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdjectiveSessionSchema = new Schema<IAdjectiveSession>({
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
  sessionId: {
    type: String,
    required: true
  },
  adjectives: [{
    type: String,
    required: true
  }],
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  collection: 'adjective_sessions'
});

const AdjectiveSession = mongoose.model<IAdjectiveSession>('AdjectiveSession', AdjectiveSessionSchema);

export default AdjectiveSession;