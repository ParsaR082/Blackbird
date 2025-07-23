export const dynamic = "force-dynamic";

import { PrismaClient } from '../../generated/prisma'
import ClientGamesPage from './ClientGamesPage'

export default async function GamesPage() {
  try {
    const prisma = new PrismaClient()
    const dbGames = await prisma.game.findMany({ orderBy: { createdAt: 'desc' } })
    await prisma.$disconnect()
    return <ClientGamesPage dbGames={dbGames} />
  } catch (error) {
    console.error('Database connection error:', error);
    // Return the client component with empty games array
    return <ClientGamesPage dbGames={[]} />
  }
}