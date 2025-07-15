import { NextRequest, NextResponse } from 'next/server';
import { UserRoadmapProgress } from '@/lib/models/user-roadmap-progress';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  await connectToDatabase();
  const progress = await UserRoadmapProgress.findOne({ userId: params.userId });
  if (!progress) return NextResponse.json({}, { status: 404 });
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  await connectToDatabase();
  const data = await req.json();
  let progress = await UserRoadmapProgress.findOne({ userId: params.userId });
  if (!progress) {
    progress = await UserRoadmapProgress.create({ userId: params.userId, ...data });
  } else {
    Object.assign(progress, data);
    await progress.save();
  }
  return NextResponse.json(progress);
} 