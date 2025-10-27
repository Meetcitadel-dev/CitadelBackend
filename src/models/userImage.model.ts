import mongoose, { Schema, Document } from 'mongoose';

export interface IUserImage extends Document {
  userId: string;
  imageUrl: string;
  cloudfrontUrl?: string;
  slot?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserImageSchema = new Schema<IUserImage>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudfrontUrl: String,
  slot: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'user_images'
});

const UserImage = mongoose.model<IUserImage>('UserImage', UserImageSchema);

export default UserImage;