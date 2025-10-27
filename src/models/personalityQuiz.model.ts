import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonalityQuizQuestion extends Document {
  questionId: string;
  question: string;
  options: string[];
  category: 'social' | 'food' | 'lifestyle' | 'personality' | 'interests';
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalityQuizQuestionSchema = new Schema<IPersonalityQuizQuestion>({
  questionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    enum: ['social', 'food', 'lifestyle', 'personality', 'interests'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'personality_quiz_questions'
});

// Create indexes
PersonalityQuizQuestionSchema.index({ order: 1 });
PersonalityQuizQuestionSchema.index({ isActive: 1 });

const PersonalityQuizQuestion = mongoose.model<IPersonalityQuizQuestion>('PersonalityQuizQuestion', PersonalityQuizQuestionSchema);

export default PersonalityQuizQuestion;

