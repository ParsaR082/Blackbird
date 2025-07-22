import { PrismaClient } from '../../generated/prisma'
import ClientGamesPage from './ClientGamesPage'

export default async function GamesPage() {
  const prisma = new PrismaClient()
  const dbGames = await prisma.game.findMany({ orderBy: { createdAt: 'desc' } })
  await prisma.$disconnect()
  return <ClientGamesPage dbGames={dbGames} />
}