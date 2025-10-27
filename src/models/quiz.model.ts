import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

const QuizSchema = new Schema<IQuiz>({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'personality', 'interests', 'academic', 'lifestyle']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  points: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
