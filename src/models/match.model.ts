import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  user1Id: string;
  user2Id: string;
  mutualAdjective: string;
  matchTimestamp: Date;
  iceBreakingPrompt: string;
  isConnected: boolean;
  connectionTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
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
  mutualAdjective: {
    type: String,
    required: true
  },
  matchTimestamp: {
    type: Date,
    default: Date.now
  },
  iceBreakingPrompt: {
    type: String,
    required: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  connectionTimestamp: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'matches'
});

const Match = mongoose.model<IMatch>('Match', MatchSchema);

export default Match;