import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
const prisma = new PrismaClient();

export async function GET() {
  const categories = await prisma.game.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return NextResponse.json(categories.map(c => c.category));
} 