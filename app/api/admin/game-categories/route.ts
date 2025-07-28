import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Return the 4 categories you requested
  const categories = ["strategy", "arcade", "puzzle", "action"];
  return NextResponse.json(categories, { status: 200 });
}