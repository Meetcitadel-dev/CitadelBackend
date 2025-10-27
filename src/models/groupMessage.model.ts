import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMessage extends Document {
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMessageSchema = new Schema<IGroupMessage>({
  groupId: {
    type: String,
    required: true,
    ref: 'Group'
  },
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'group_messages'
});

const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', GroupMessageSchema);

export default GroupMessage;