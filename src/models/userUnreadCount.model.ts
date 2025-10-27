import mongoose, { Schema, Document } from 'mongoose';

export interface IUserUnreadCount extends Document {
  userId: string;
  chatId: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserUnreadCountSchema = new Schema<IUserUnreadCount>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  chatId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  lastMessageId: String
}, {
  timestamps: true,
  collection: 'user_unread_counts'
});

const UserUnreadCount = mongoose.model<IUserUnreadCount>('UserUnreadCount', UserUnreadCountSchema);

export default UserUnreadCount;