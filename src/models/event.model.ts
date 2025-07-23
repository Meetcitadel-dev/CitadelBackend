import mongoose, { Schema, Document } from 'mongoose';

export interface EventDocument extends Document {
  userId: string;
  type: string;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<EventDocument>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model<EventDocument>('Event', EventSchema);







