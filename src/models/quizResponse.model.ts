import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResponse extends Document {
  userId: string;
  quizId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  points: number;
  timeSpent: number; // in seconds
  submittedAt: Date;
}

const QuizResponseSchema = new Schema<IQuizResponse>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  quizId: {
    type: String,
    required: true,
    ref: 'Quiz'
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IQuizResponse>('QuizResponse', QuizResponseSchema);
