// src/models/Habit.js
import mongoose from 'mongoose';

const HabitHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
});

const HabitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  history: [HabitHistorySchema]
});

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);