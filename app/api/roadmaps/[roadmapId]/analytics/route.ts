export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { Roadmap } from '@/lib/models/roadmap';
import { UserRoadmapProgress } from '@/lib/models/user-roadmap-progress';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { roadmapId: string } }) {
  await connectToDatabase();
  
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) {
    return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
  }

  // Get all user progress for this roadmap
  const userProgressData = await UserRoadmapProgress.find({ roadmapId: params.roadmapId });
  
  // Calculate analytics
  const totalUsers = userProgressData.length;
  const completedChallenges = userProgressData.reduce((acc, progress) => 
    acc + (progress.completedChallenges?.length || 0), 0
  );
  const completedLevels = userProgressData.reduce((acc, progress) => 
    acc + (progress.completedLevels?.length || 0), 0
  );
  
  // Calculate total challenges and levels in roadmap
  const totalLevels = roadmap.levels?.length || 0;
  const totalChallenges = roadmap.levels?.reduce((acc: number, level: any) => 
    acc + (level.milestones?.reduce((msAcc: number, milestone: any) => 
      msAcc + (milestone.challenges?.length || 0), 0) || 0), 0
  ) || 0;

  // Calculate completion rates
  const levelCompletionRate = totalLevels > 0 ? (completedLevels / (totalUsers * totalLevels)) * 100 : 0;
  const challengeCompletionRate = totalChallenges > 0 ? (completedChallenges / (totalUsers * totalChallenges)) * 100 : 0;

  // Get most popular levels (by completion count)
  const levelStats = roadmap.levels?.map((level: any) => {
    const completions = userProgressData.filter(progress => 
      progress.completedLevels?.includes(level._id.toString())
    ).length;
    
    return {
      id: level._id.toString(),
      title: level.title,
      completions,
      completionRate: totalUsers > 0 ? (completions / totalUsers) * 100 : 0
    };
  }).sort((a: any, b: any) => b.completions - a.completions) || [];

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentActivity = userProgressData.filter(progress => 
    progress.updatedAt && progress.updatedAt > sevenDaysAgo
  ).length;

  return NextResponse.json({
    roadmapId: params.roadmapId,
    roadmapTitle: roadmap.title,
    totalUsers,
    totalLevels,
    totalChallenges,
    completedLevels,
    completedChallenges,
    levelCompletionRate: Math.round(levelCompletionRate * 100) / 100,
    challengeCompletionRate: Math.round(challengeCompletionRate * 100) / 100,
    levelStats,
    recentActivity,
    generatedAt: new Date().toISOString()
  });
} 