import mongoose, { Schema, Document } from 'mongoose';

export interface IConnectionRequest extends Document {
  requesterId: string;
  targetId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>({
  requesterId: {
    type: String,
    required: true,
    ref: 'User'
  },
  targetId: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'connection_requests'
});

const ConnectionRequest = mongoose.model<IConnectionRequest>('ConnectionRequest', ConnectionRequestSchema);

export default ConnectionRequest;