import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  question: string;
  answer: string | number; // Can be string for text/multiple-choice or number for scale
}

export interface IPersonalityQuizSubmission extends Document {
  quizId: string;
  userName: string;
  answers: IAnswer[];
  submittedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: Schema.Types.Mixed, // Can be string or number
    required: true
  }
}, { _id: false });

const PersonalityQuizSubmissionSchema = new Schema<IPersonalityQuizSubmission>({
  quizId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'PersonalityQuiz'
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  answers: {
    type: [AnswerSchema],
    required: true,
    validate: {
      validator: function(answers: IAnswer[]) {
        return answers && answers.length > 0;
      },
      message: 'At least one answer is required'
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'personalityQuizSubmissions'
});

// Create indexes for better query performance
PersonalityQuizSubmissionSchema.index({ quizId: 1 });
PersonalityQuizSubmissionSchema.index({ userName: 1 });
PersonalityQuizSubmissionSchema.index({ submittedAt: -1 });

export default mongoose.model<IPersonalityQuizSubmission>('PersonalityQuizSubmission', PersonalityQuizSubmissionSchema);

