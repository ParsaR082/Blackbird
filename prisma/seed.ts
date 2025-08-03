import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const games = [
    {
      title: 'Fire Frenzy',
      description: 'Fast-paced action game with fiery obstacles and power-ups.',
      link: 'https://fire-frenzy.example.com',
      category: 'Action',
      color: 'from-red-500/20 to-orange-500/20',
      isMultiplayer: true,
    },
    {
      title: 'Mind Bender',
      description: 'Challenging puzzles to twist and bend your mind.',
      link: 'https://mind-bender.example.com',
      category: 'Puzzle',
      color: 'from-green-500/20 to-emerald-500/20',
      isMultiplayer: false,
    },
    {
      title: 'WordSprint',
      description: 'Race against time to form words and score points.',
      link: 'https://wordsprint.example.com',
      category: 'Arcade',
      color: 'from-blue-500/20 to-cyan-500/20',
      isMultiplayer: true,
    },
    {
      title: 'Tic Tac Boom',
      description: 'Classic tic-tac-toe with explosive twists and multiplayer mode.',
      link: 'https://tic-tac-boom.example.com',
      category: 'Strategy',
      color: 'from-purple-500/20 to-pink-500/20',
      isMultiplayer: true,
    },
    {
      title: 'Memory Match',
      description: 'Test your memory skills in this fun and challenging game.',
      link: 'https://memory-match.example.com',
      category: 'Puzzle',
      color: 'from-green-500/20 to-emerald-500/20',
      isMultiplayer: false,
    },
    {
      title: 'Maze Craze',
      description: 'Navigate through complex mazes and beat the clock.',
      link: 'https://maze-craze.example.com',
      category: 'Arcade',
      color: 'from-blue-500/20 to-cyan-500/20',
      isMultiplayer: false,
    },
  ]

  await prisma.game.createMany({
    data: games
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })