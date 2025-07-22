import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/roadmaps/route';
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

describe('/api/roadmaps', () => {
  let testRoadmapId: string;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    if (testRoadmapId) {
      await Roadmap.findByIdAndDelete(testRoadmapId);
    }
  });

  it('GET should return an array of roadmaps', async () => {
    const req = createMockRequest('http://localhost/api/roadmaps');
    const res = await GET(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST should create a new roadmap', async () => {
    const roadmap = { title: 'Test Roadmap', description: 'Test', icon: 'map', visibility: 'public', levels: [] };
    const req = createMockRequest('http://localhost/api/roadmaps', {
      method: 'POST',
      body: JSON.stringify(roadmap),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.title).toBe('Test Roadmap');
    
    // Store ID for cleanup
    testRoadmapId = data._id;
  });
});