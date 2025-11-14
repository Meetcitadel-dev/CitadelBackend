import mongoose, { Schema, Document } from 'mongoose';

export interface IUserImage extends Document {
  userId: string;
  imageUrl: string;
  cloudfrontUrl?: string;
  s3Key?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
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
  s3Key: String,
  originalName: String,
  mimeType: String,
  fileSize: Number,
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