import mongoose, { Schema, Document } from 'mongoose';

export interface IInteraction extends Document {
  userId: string;
  targetUserId: string;
  interactionType: string;
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema = new Schema<IInteraction>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  targetUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  interactionType: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'interactions'
});

const Interaction = mongoose.model<IInteraction>('Interaction', InteractionSchema);

export default Interaction;