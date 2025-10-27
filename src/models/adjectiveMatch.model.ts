import mongoose, { Schema, Document } from 'mongoose';

export interface IAdjectiveMatch extends Document {
  user1Id: string;
  user2Id: string;
  adjective: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdjectiveMatchSchema = new Schema<IAdjectiveMatch>({
  user1Id: {
    type: String,
    required: true,
    ref: 'User'
  },
  user2Id: {
    type: String,
    required: true,
    ref: 'User'
  },
  adjective: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'adjective_matches'
});

const AdjectiveMatch = mongoose.model<IAdjectiveMatch>('AdjectiveMatch', AdjectiveMatchSchema);

export default AdjectiveMatch;