import mongoose, { Schema, Document } from 'mongoose';

export interface IUserImageSlot extends Document {
  userId: string;
  slot: number;
  userImageId: string;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserImageSlotSchema = new Schema<IUserImageSlot>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  slot: {
    type: Number,
    required: true
  },
  userImageId: {
    type: String,
    required: true,
    ref: 'UserImage'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'user_image_slots'
});

const UserImageSlot = mongoose.model<IUserImageSlot>('UserImageSlot', UserImageSlotSchema);

export default UserImageSlot;