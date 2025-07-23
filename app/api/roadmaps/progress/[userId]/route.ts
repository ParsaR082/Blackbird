export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { UserRoadmapProgress } from '@/lib/models/user-roadmap-progress';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  await connectToDatabase();
  const url = new URL(req.url);
  const roadmapId = url.searchParams.get('roadmapId');
  
  if (!roadmapId) {
    return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 });
  }
  
  let progress = await UserRoadmapProgress.findOne({ 
    userId: params.userId, 
    roadmapId: roadmapId 
  });
  
  if (!progress) {
    progress = await UserRoadmapProgress.create({ 
      userId: params.userId, 
      roadmapId: roadmapId,
      completedChallenges: [], 
      completedLevels: [],
      achievements: [] 
    });
  }
  
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  await connectToDatabase();
  const data = await req.json();
  
  if (!data.roadmapId) {
    return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 });
  }
  
  let progress = await UserRoadmapProgress.findOne({ 
    userId: params.userId, 
    roadmapId: data.roadmapId 
  });
  
  if (!progress) {
    progress = await UserRoadmapProgress.create({ 
      userId: params.userId, 
      ...data 
    });
  } else {
    Object.assign(progress, data);
    await progress.save();
  }
  
  return NextResponse.json(progress);
} 