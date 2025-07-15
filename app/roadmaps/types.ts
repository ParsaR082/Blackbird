// Roadmaps system shared types

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'project' | 'reading';
  resources?: string[];
  completed?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  challenges: Challenge[];
  dueDate?: string;
  reward?: string;
}

export interface Level {
  id: string;
  title: string;
  order: number;
  milestones: Milestone[];
  unlockRequirements?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  icon?: string;
  levels: Level[];
  visibility: 'public' | 'private';
}

export interface UserProgress {
  roadmapId: string;
  currentLevelId: string;
  currentMilestoneId: string;
  completedChallenges: string[];
  achievements: string[];
} 