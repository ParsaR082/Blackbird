import { NextRequest, NextResponse } from 'next/server';
import { Roadmap } from '@/lib/models/roadmap';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { roadmapId: string, levelId: string, milestoneId: string } }) {
  await connectToDatabase();
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) return NextResponse.json([], { status: 404 });
  const level = roadmap.levels.id(params.levelId);
  if (!level) return NextResponse.json([], { status: 404 });
  const milestone = level.milestones.id(params.milestoneId);
  if (!milestone) return NextResponse.json([], { status: 404 });
  return NextResponse.json(milestone.challenges || []);
}

export async function POST(req: NextRequest, { params }: { params: { roadmapId: string, levelId: string, milestoneId: string } }) {
  await connectToDatabase();
  const data = await req.json();
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
  const level = roadmap.levels.id(params.levelId);
  if (!level) return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  const milestone = level.milestones.id(params.milestoneId);
  if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
  if (data.id) {
    // Edit existing challenge
    const idx = milestone.challenges.findIndex((c: any) => c._id.toString() === data.id);
    if (idx !== -1) {
      milestone.challenges[idx].title = data.title;
      milestone.challenges[idx].description = data.description;
      milestone.challenges[idx].type = data.type;
    }
  } else {
    // Add new challenge
    milestone.challenges.push({ title: data.title, description: data.description, type: data.type });
  }
  await roadmap.save();
  return NextResponse.json(milestone.challenges);
} 