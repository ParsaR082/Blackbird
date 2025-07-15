import { NextRequest, NextResponse } from 'next/server';
import { Roadmap } from '@/lib/models/roadmap';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const roadmaps = await Roadmap.find({});
  return NextResponse.json(roadmaps);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const data = await req.json();
  const roadmap = await Roadmap.create(data);
  return NextResponse.json(roadmap);
} 