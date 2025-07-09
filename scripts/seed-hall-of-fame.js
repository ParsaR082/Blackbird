const mongoose = require('mongoose')

// Connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Avestami:xKuiw9ie7AacuMrI@blackbird.3qpqiyp.mongodb.net/?retryWrites=true&w=majority&appName=blackbird'

// User schema
const UserSchema = new mongoose.Schema({
  studentId: String,
  phoneNumber: String,
  username: String,
  email: String,
  password: String,
  fullName: String,
  role: String,
  isVerified: Boolean,
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
})

// Hall of Fame schema
const HallOfFameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: String,
  achievement: String,
  category: String,
  dateInducted: Date,
  yearAchieved: String,
  addedBy: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  order: Number
}, {
  timestamps: true
})

// UserStats schema
const UserStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: Number,
  contributions: Number,
  specialAchievements: [String],
  joinDate: Date,
  tier: String,
  totalProjects: Number,
  totalCollaborations: Number,
  totalMentees: Number,
  industryRecognitions: [String],
  publications: [String]
}, {
  timestamps: true
})

async function seedHallOfFame() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('🔗 Connected to MongoDB')

    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const HallOfFame = mongoose.models.HallOfFame || mongoose.model('HallOfFame', HallOfFameSchema)
    const UserStats = mongoose.models.UserStats || mongoose.model('UserStats', UserStatsSchema)

    // Get all users from database
    const users = await User.find({ role: { $in: ['USER', 'ADMIN'] } }).limit(10)
    
    if (users.length === 0) {
      console.log('❌ No users found in database. Please register some users first.')
      return
    }

    console.log(`📊 Found ${users.length} users in database`)

    // Clear existing Hall of Fame entries
    await HallOfFame.deleteMany({})
    console.log('🧹 Cleared existing Hall of Fame entries')

    // Sample Hall of Fame data templates
    const hallOfFameTemplates = [
      {
        title: 'AI Pioneer',
        achievement: 'Breakthrough research in neural architecture optimization and transformer models',
        category: 'Innovation',
        yearAchieved: '2024'
      },
      {
        title: 'Robotics Virtuoso',
        achievement: 'Revolutionary autonomous navigation system deployed in industrial environments',
        category: 'Innovation',
        yearAchieved: '2024'
      },
      {
        title: 'Community Leader',
        achievement: 'Mentored over 100 students and built thriving learning communities',
        category: 'Leadership',
        yearAchieved: '2023'
      },
      {
        title: 'Research Excellence',
        achievement: 'Published groundbreaking papers in quantum computing applications',
        category: 'Research',
        yearAchieved: '2023'
      },
      {
        title: 'Open Source Champion',
        achievement: 'Created frameworks adopted by millions of developers worldwide',
        category: 'Community',
        yearAchieved: '2024'
      },
      {
        title: 'Digital Innovator',
        achievement: 'Pioneered sustainable technology solutions for climate change',
        category: 'Innovation',
        yearAchieved: '2023'
      },
      {
        title: 'Education Transformer',
        achievement: 'Revolutionized online learning with interactive AI tutoring systems',
        category: 'Leadership',
        yearAchieved: '2024'
      },
      {
        title: 'Data Science Visionary',
        achievement: 'Advanced predictive analytics for healthcare and social good',
        category: 'Research',
        yearAchieved: '2023'
      }
    ]

    // Find an admin user to set as the "addedBy" for all entries
    const adminUser = await User.findOne({ role: 'ADMIN' })
    const addedBy = adminUser ? adminUser._id : users[0]._id

    // Create Hall of Fame entries for available users
    const hallOfFameEntries = []
    const userStatsEntries = []

    for (let i = 0; i < Math.min(users.length, hallOfFameTemplates.length); i++) {
      const user = users[i]
      const template = hallOfFameTemplates[i]

      // Create Hall of Fame entry
      const hallOfFameEntry = {
        userId: user._id,
        title: template.title,
        achievement: template.achievement,
        category: template.category,
        yearAchieved: template.yearAchieved,
        addedBy: addedBy,
        isActive: true,
        order: i + 1,
        dateInducted: new Date()
      }

      hallOfFameEntries.push(hallOfFameEntry)

      // Create or update user stats
      const userStatsEntry = {
        userId: user._id,
        points: 50000 + (i * 5000), // Varied points
        contributions: 1000 + (i * 100),
        specialAchievements: ['Hall of Fame Inductee', template.title],
        joinDate: user.createdAt || new Date(),
        tier: 'halloffame',
        totalProjects: 20 + (i * 5),
        totalCollaborations: 50 + (i * 10),
        totalMentees: 10 + (i * 5),
        industryRecognitions: [`${template.category} Excellence Award`],
        publications: [`Research in ${template.category}`]
      }

      userStatsEntries.push(userStatsEntry)

      console.log(`✅ Prepared Hall of Fame entry for: ${user.fullName} - ${template.title}`)
    }

    // Insert Hall of Fame entries
    await HallOfFame.insertMany(hallOfFameEntries)
    console.log(`🏆 Created ${hallOfFameEntries.length} Hall of Fame entries`)

    // Update user stats
    for (const statsEntry of userStatsEntries) {
      await UserStats.findOneAndUpdate(
        { userId: statsEntry.userId },
        { $set: statsEntry },
        { upsert: true, new: true }
      )
    }
    console.log(`📈 Updated stats for ${userStatsEntries.length} users`)

    // Display summary
    console.log('\n🎉 Hall of Fame seeding completed!')
    console.log('📊 Summary:')
    
    const categoryCounts = await HallOfFame.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])

    categoryCounts.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} entries`)
    })

    console.log(`\n🌐 Access Hall of Fame at: http://localhost:3000/hall-of-fame`)

  } catch (error) {
    console.error('❌ Error seeding Hall of Fame:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the seeding function
seedHallOfFame() 