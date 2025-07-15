import mongoose, { Schema, model, models } from 'mongoose';

const ChallengeSchema = new Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['quiz', 'project', 'reading'], default: 'project' },
  resources: [String],
});

const MilestoneSchema = new Schema({
  title: String,
  description: String,
  challenges: [ChallengeSchema],
  dueDate: String,
  reward: String,
});

const LevelSchema = new Schema({
  title: String,
  order: Number,
  milestones: [MilestoneSchema],
  unlockRequirements: String,
});

const RoadmapSchema = new Schema({
  title: String,
  description: String,
  icon: String,
  levels: [LevelSchema],
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
});

export const Roadmap = models.Roadmap || model('Roadmap', RoadmapSchema); 