import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Return the 4 categories you requested
    const categories = ["strategy", "arcade", "puzzle", "action"];
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error in game-categories API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}