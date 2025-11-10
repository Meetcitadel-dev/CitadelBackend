import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  isEmailVerified: boolean;
  otpAttempts: number;
  name?: string;
  username?: string;
  universityId?: string;
  degree?: string;
  year?: string;
  gender?: string;
  dateOfBirth?: Date;
  skills?: string[];
  friends?: string[];
  aboutMe?: string;
  sports?: string;
  movies?: string;
  tvShows?: string;
  teams?: string;
  portfolioLink?: string;
  phoneNumber?: string;
  isProfileComplete: boolean;
  hasCompletedQuiz: boolean;
  quizScore: number;
  quizCompletedAt: Date;
  onboardingStep?: string;
  onboardingData?: any;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  name: {
    type: String
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  universityId: {
    type: String,
    ref: 'University'
  },
  degree: String,
  year: String,
  gender: String,
  dateOfBirth: Date,
  skills: [String],
  friends: [String],
  aboutMe: String,
  sports: String,
  movies: String,
  tvShows: String,
  teams: String,
  portfolioLink: String,
  phoneNumber: String,
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  hasCompletedQuiz: {
    type: Boolean,
    default: false
  },
  quizScore: {
    type: Number,
    default: 0
  },
  quizCompletedAt: {
    type: Date
  },
  onboardingStep: {
    type: String
  },
  onboardingData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ universityId: 1 });
UserSchema.index({ name: 1 });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;