import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMember extends Document {
  groupId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>({
  groupId: {
    type: String,
    required: true,
    ref: 'Group'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'member'],
    default: 'member'
  }
}, {
  timestamps: true,
  collection: 'group_members'
});

const GroupMember = mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);

export default GroupMember;