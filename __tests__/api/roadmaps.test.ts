import request from 'supertest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import handler from '../../app/api/roadmaps/route';
import { connectToDatabase } from '../../lib/mongodb';

describe('/api/roadmaps', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  it('GET should return an array of roadmaps', async () => {
    const server = createServer((req, res) => apiResolver(req, res, undefined, handler, {}));
    const res = await request(server).get('/api/roadmaps');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    server.close();
  });

  it('POST should create a new roadmap', async () => {
    const server = createServer((req, res) => apiResolver(req, res, undefined, handler, {}));
    const roadmap = { title: 'Test Roadmap', description: 'Test', icon: 'map', visibility: 'public', levels: [] };
    const res = await request(server).post('/api/roadmaps').send(roadmap);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Roadmap');
    server.close();
  });
}); 