export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { Roadmap } from '@/lib/models/roadmap';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const roadmaps = await Roadmap.find({});
  // Map all nested objects to have id and _id
  const mapped = roadmaps.map((rm: any) => ({
    ...rm.toObject(),
    id: rm._id.toString(),
    levels: (rm.levels || []).map((lvl: any) => ({
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
    }))
  }));
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const data = await req.json();
  const roadmap = await Roadmap.create(data);
  return NextResponse.json(roadmap);
}

export async function PUT(req: NextRequest) {
  await connectToDatabase();
  const data = await req.json();
  const roadmapId = data.id || data._id;
  if (!roadmapId) {
    return NextResponse.json({ error: 'Missing roadmap id' }, { status: 400 });
  }
  const { id, _id, ...updateData } = data;
  const roadmap = await Roadmap.findByIdAndUpdate(roadmapId, updateData, { new: true });
  if (!roadmap) {
    return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
  }
  return NextResponse.json(roadmap);
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  const url = new URL(req.url);
  const roadmapId = url.searchParams.get('id');
  
  if (!roadmapId) {
    return NextResponse.json({ error: 'Missing roadmap id' }, { status: 400 });
  }
  
  const roadmap = await Roadmap.findByIdAndDelete(roadmapId);
  if (!roadmap) {
    return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
  }
  
  return NextResponse.json({ message: 'Roadmap deleted successfully' });
} 