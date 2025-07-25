import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { GameSchema } from "@/app/games/ClientGamesPage";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  return NextResponse.json({ error: "Temporarily disabled for build" }, { status: 503 });
} 