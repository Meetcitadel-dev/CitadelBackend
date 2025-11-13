import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  type: 'yes-no' | 'multiple-choice' | 'scale' | 'text' | 'yesno' | 'choice' | 'rating';
  options?: string[]; // For multiple-choice and choice questions
}

export interface IPersonalityQuiz extends Document {
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

const PersonalityQuizSchema = new Schema<IPersonalityQuiz>({
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
        return questions && questions.length > 0;
      },
      message: 'At least one question is required'
    }
  }
}, {
  timestamps: true,
  collection: 'personalityQuizzes'
});

export default mongoose.model<IPersonalityQuiz>('PersonalityQuiz', PersonalityQuizSchema);
