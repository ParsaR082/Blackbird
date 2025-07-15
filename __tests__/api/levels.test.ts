import request from 'supertest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import handler from '../../app/api/roadmaps/[roadmapId]/levels/route';
import { connectToDatabase } from '../../lib/mongodb';
import { Roadmap } from '../../lib/models/roadmap';

describe('/api/roadmaps/[roadmapId]/levels', () => {
  let roadmapId: string;

  beforeAll(async () => {
    await connectToDatabase();
    // Create a roadmap for testing
    const roadmap = await Roadmap.create({ title: 'Test Roadmap', description: 'Test', icon: 'map', visibility: 'public', levels: [] });
    roadmapId = roadmap._id.toString();
  });

  it('GET should return an array of levels', async () => {
    const server = createServer((req, res) => apiResolver(req, res, { roadmapId }, handler, {}));
    const res = await request(server).get(`/api/roadmaps/${roadmapId}/levels`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    server.close();
  });

  it('POST should add a new level', async () => {
    const server = createServer((req, res) => apiResolver(req, res, { roadmapId }, handler, {}));
    const level = { title: 'Test Level', order: 1, milestones: [] };
    const res = await request(server).post(`/api/roadmaps/${roadmapId}/levels`).send(level);
    expect(res.statusCode).toBe(200);
    expect(res.body.some((l: any) => l.title === 'Test Level')).toBe(true);
    server.close();
  });
}); 