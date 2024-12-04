import mongoose from 'mongoose';

export interface IJournal extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'neutral' | 'anxious' | 'excited';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'neutral', 'anxious', 'excited'],
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
journalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Journal = mongoose.model<IJournal>('Journal', journalSchema); 