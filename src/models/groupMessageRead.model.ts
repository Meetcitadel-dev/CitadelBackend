import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMessageRead extends Document {
  messageId: string;
  userId: string;
  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMessageReadSchema = new Schema<IGroupMessageRead>({
  messageId: {
    type: String,
    required: true,
    ref: 'GroupMessage'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'group_message_reads'
});

const GroupMessageRead = mongoose.model<IGroupMessageRead>('GroupMessageRead', GroupMessageReadSchema);

export default GroupMessageRead;