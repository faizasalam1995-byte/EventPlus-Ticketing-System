import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'attendee' | 'organizer' | 'admin';
  phone?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['attendee', 'organizer', 'admin'],
      default: 'attendee',
      required: true,
    },
    phone: { type: String, default: '' },
    organization: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
