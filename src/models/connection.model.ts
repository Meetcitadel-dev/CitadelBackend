import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  user1Id: string;
  user2Id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
  user1Id: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  user2Id: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['connected', 'pending', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'connections'
});

ConnectionSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);

export default Connection;