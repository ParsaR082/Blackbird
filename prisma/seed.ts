import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create SUPER_ADMIN user
  console.log('👤 Creating SUPER_ADMIN user...')
  
  const hashedPassword = await bcrypt.hash('BlackbirdAdmin42!', 12)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@blackbird.local' },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
    create: {
      email: 'superadmin@blackbird.local',
      password: hashedPassword,
      fullName: 'Super Administrator',
      role: 'SUPER_ADMIN',
      isVerified: true,
    }
  })

  console.log('✅ SUPER_ADMIN user created/updated:', superAdmin.email)
  console.log('📧 Email: superadmin@blackbird.local')
  console.log('🔑 Password: BlackbirdAdmin42!')

  // Seed games
  console.log('🎮 Seeding games...')
  
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

  // Use upsert for games to avoid duplicates
  for (const game of games) {
    await prisma.game.upsert({
      where: { title: game.title },
      update: game,
      create: game,
    })
  }

  console.log('✅ Games seeded successfully')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })