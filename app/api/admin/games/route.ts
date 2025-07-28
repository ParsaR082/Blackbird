import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateAdmin } from "@/lib/server-utils";
import { z } from "zod";

const prisma = new PrismaClient();

// Server-side schema for game validation - all fields required to match Prisma schema
const GameSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  link: z.string().url('Must be a valid URL'),
  category: z.string().min(3),
  color: z.string().min(3),
  isMultiplayer: z.boolean().default(false), // Changed from optional to default
});

export async function POST(req: NextRequest) {
  try {
    // Use the same authentication method as the frontend
    const validation = await validateAdmin(req);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: validation.status });
    }

    // Parse and validate the request body
    const body = await req.json();
    const validatedData = GameSchema.parse(body);

    // Test database connection first
    try {
      await prisma.$connect();
      
      // Create the game with properly typed data
      const game = await prisma.game.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          link: validatedData.link,
          category: validatedData.category,
          color: validatedData.color,
          isMultiplayer: validatedData.isMultiplayer,
        }
      });

      return NextResponse.json(game, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: "Database connection failed" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Game creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid data provided",
        details: error.message 
      }, { status: 400 });
    }

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: "Game with this title already exists"
        }, { status: 409 });
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ 
          error: "Invalid category reference"
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: "Failed to create game",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}