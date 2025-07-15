import { NextRequest, NextResponse } from 'next/server';
import { Roadmap } from '@/lib/models/roadmap';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { roadmapId: string, levelId: string } }) {
  await connectToDatabase();
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) return NextResponse.json([], { status: 404 });
  const level = roadmap.levels.id(params.levelId);
  if (!level) return NextResponse.json([], { status: 404 });
  return NextResponse.json(level.milestones || []);
}

export async function POST(req: NextRequest, { params }: { params: { roadmapId: string, levelId: string } }) {
  await connectToDatabase();
  const data = await req.json();
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
  const level = roadmap.levels.id(params.levelId);
  if (!level) return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  if (data.id) {
    // Edit existing milestone
    const idx = level.milestones.findIndex((m: any) => m._id.toString() === data.id);
    if (idx !== -1) {
      level.milestones[idx].title = data.title;
      level.milestones[idx].description = data.description;
      // Optionally update challenges
    }
  } else {
    // Add new milestone
    level.milestones.push({ title: data.title, description: data.description, challenges: [] });
  }
  await roadmap.save();
  return NextResponse.json(level.milestones);
} 