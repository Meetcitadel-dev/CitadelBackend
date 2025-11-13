import mongoose, { Schema, Document } from 'mongoose';

export type QuestionType =
  | 'yes-no'
  | 'multiple-choice'
  | 'scale'
  | 'text'
  | 'yesno'
  | 'choice'
  | 'rating';

export interface IQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
}

export interface IPersonalityQuizSet extends Document {
  title: string;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['yes-no', 'multiple-choice', 'scale', 'text', 'yesno', 'choice', 'rating'],
    default: 'scale'
  },
  options: [{
    type: String,
    trim: true
  }]
}, { _id: false });

const PersonalityQuizSetSchema = new Schema<IPersonalityQuizSet>({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Personality Quiz'
  },
  questions: {
    type: [QuestionSchema],
    required: true,
    validate: {
      validator: function(questions: IQuestion[]) {
        return Array.isArray(questions) && questions.length > 0;
      },
      message: 'At least one question is required'
    }
  }
}, {
  timestamps: true,
  collection: 'personalityQuizzes'
});

export default mongoose.model<IPersonalityQuizSet>('PersonalityQuizSet', PersonalityQuizSetSchema);

