import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  user1Id: {
    type: String,
    required: true,
    ref: 'User'
  },
  user2Id: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'conversations'
});

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;