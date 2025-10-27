import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationReadStatus extends Document {
  userId: string;
  notificationId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationReadStatusSchema = new Schema<INotificationReadStatus>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  notificationId: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'notification_read_status'
});

const NotificationReadStatus = mongoose.model<INotificationReadStatus>('NotificationReadStatus', NotificationReadStatusSchema);

export default NotificationReadStatus;