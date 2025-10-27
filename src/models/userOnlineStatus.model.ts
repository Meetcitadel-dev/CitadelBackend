import mongoose, { Schema, Document } from 'mongoose';

export interface IUserOnlineStatus extends Document {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserOnlineStatusSchema = new Schema<IUserOnlineStatus>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'user_online_status'
});

const UserOnlineStatus = mongoose.model<IUserOnlineStatus>('UserOnlineStatus', UserOnlineStatusSchema);

export default UserOnlineStatus;