import mongoose, { Schema, model, models } from 'mongoose';

const UserRoadmapProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  currentLevelId: String,
  currentMilestoneId: String,
  completedChallenges: [String],
  completedLevels: [String],
  achievements: [String],
});

export const UserRoadmapProgress = models.UserRoadmapProgress || model('UserRoadmapProgress', UserRoadmapProgressSchema); 