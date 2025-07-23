export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { Roadmap } from '@/lib/models/roadmap';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { roadmapId: string } }) {
  await connectToDatabase();
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) return NextResponse.json([], { status: 404 });
  const levels = (roadmap.levels || []).map((lvl: any) => ({
    ...lvl.toObject(),
    id: lvl._id?.toString() || '',
    milestones: (lvl.milestones || []).map((ms: any) => ({
      ...ms.toObject(),
      id: ms._id?.toString() || '',
      challenges: (ms.challenges || []).map((ch: any) => ({
        ...ch.toObject(),
        id: ch._id?.toString() || ''
      }))
    }))
  }));
  return NextResponse.json(levels);
}

export async function POST(req: NextRequest, { params }: { params: { roadmapId: string } }) {
  await connectToDatabase();
  const data = await req.json();
  const roadmap = await Roadmap.findById(params.roadmapId);
  if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
  if (data.id) {
    // Edit existing level
    const idx = roadmap.levels.findIndex((l: any) => l._id.toString() === data.id);
    if (idx !== -1) {
      roadmap.levels[idx].title = data.title;
      roadmap.levels[idx].order = data.order;
      // Optionally update milestones
    }
  } else {
    // Add new level
    roadmap.levels.push({ title: data.title, order: data.order, milestones: [] });
  }
  await roadmap.save();
  return NextResponse.json(roadmap.levels);
} 