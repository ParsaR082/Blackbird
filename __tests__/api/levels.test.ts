import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/roadmaps/[roadmapId]/levels/route';
import { connectToDatabase } from '../../lib/mongodb';
import { Roadmap } from '../../lib/models/roadmap';

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit): NextRequest => {
  const init = options ? {
    ...options,
    signal: options.signal || undefined
  } : undefined;
  return new NextRequest(new URL(url, 'http://localhost'), init);
};

describe('/api/roadmaps/[roadmapId]/levels', () => {
  let roadmapId: string;

  beforeAll(async () => {
    await connectToDatabase();
    // Create a roadmap for testing
    const roadmap = await Roadmap.create({ title: 'Test Roadmap', description: 'Test', icon: 'map', visibility: 'public', levels: [] });
    roadmapId = roadmap._id.toString();
  });

  afterAll(async () => {
    // Clean up test data
    await Roadmap.findByIdAndDelete(roadmapId);
  });

  it('GET should return an array of levels', async () => {
    const req = createMockRequest(`http://localhost/api/roadmaps/${roadmapId}/levels`);
    const res = await GET(req, { params: { roadmapId } });
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST should add a new level', async () => {
    const level = { title: 'Test Level', order: 1, milestones: [] };
    const req = createMockRequest(`http://localhost/api/roadmaps/${roadmapId}/levels`, {
      method: 'POST',
      body: JSON.stringify(level),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const res = await POST(req, { params: { roadmapId } });
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.some((l: any) => l.title === 'Test Level')).toBe(true);
  });
});