import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'groups'
});

const Group = mongoose.model<IGroup>('Group', GroupSchema);

export default Group;