import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  return new Response(JSON.stringify([]), { status: 200 });
} 