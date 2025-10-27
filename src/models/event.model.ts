import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  name: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  location: String,
  capacity: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true,
  collection: 'events'
});

const Event = mongoose.model<IEvent>('Event', EventSchema);

export default Event;