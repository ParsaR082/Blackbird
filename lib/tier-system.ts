import { 
  Crown, 
  Star, 
  Award, 
  Trophy, 
  Zap, 
  Flame,
  Shield,
  Gem
} from 'lucide-react'

export interface BlackbirdTier {
  id: string
  name: string
  displayName: string
  description: string
  icon: React.ComponentType<any>
  color: string
  gradient: string
  requirements: {
    minPoints: number
    minContributions?: number
    minYearsActive?: number
    specialRequirements?: string[]
  }
  benefits: string[]
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
}

export const BLACKBIRD_TIERS: BlackbirdTier[] = [
  {
    id: 'nestling',
    name: 'Nestling',
    displayName: 'Nestling',
    description: 'Fresh wings, ready to take flight in the digital realm',
    icon: Crown,
    color: '#9CA3AF',
    gradient: 'from-gray-400 to-gray-600',
    requirements: {
      minPoints: 0
    },
    benefits: [
      'Access to basic modules',
      'Community forum participation',
      'Profile customization'
    ],
    rarity: 'common'
  },
  {
    id: 'fledgling',
    name: 'Fledgling',
    displayName: 'Fledgling Explorer',
    description: 'Building knowledge and spreading wings with growing confidence',
    icon: Star,
    color: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600',
    requirements: {
      minPoints: 100,
      minContributions: 5
    },
    benefits: [
      'Access to intermediate modules',
      'Priority support queue',
      'Custom profile badge',
      'Event early access'
    ],
    rarity: 'common'
  },
  {
    id: 'soaring',
    name: 'Soaring',
    displayName: 'Soaring Innovator',
    description: 'Rising high with significant contributions to the community',
    icon: Zap,
    color: '#8B5CF6',
    gradient: 'from-purple-400 to-purple-600',
    requirements: {
      minPoints: 500,
      minContributions: 25,
      minYearsActive: 0.5
    },
    benefits: [
      'Access to advanced modules',
      'Mentorship opportunities',
      'Beta feature access',
      'Custom profile themes',
      'Direct line to support team'
    ],
    rarity: 'uncommon'
  },
  {
    id: 'pioneer',
    name: 'Pioneer',
    displayName: 'Digital Pioneer',
    description: 'Blazing trails and leading innovation in the digital frontier',
    icon: Flame,
    color: '#F59E0B',
    gradient: 'from-amber-400 to-orange-600',
    requirements: {
      minPoints: 1500,
      minContributions: 100,
      minYearsActive: 1,
      specialRequirements: ['Published research', 'Community leadership']
    },
    benefits: [
      'Access to experimental features',
      'Priority collaboration matching',
      'Custom module creation tools',
      'Annual summit invitation',
      'Exclusive research previews'
    ],
    rarity: 'rare'
  },
  {
    id: 'legend',
    name: 'Legend',
    displayName: 'Blackbird Legend',
    description: 'Exceptional individuals who have made extraordinary contributions',
    icon: Award,
    color: '#10B981',
    gradient: 'from-emerald-400 to-green-600',
    requirements: {
      minPoints: 5000,
      minContributions: 250,
      minYearsActive: 2,
      specialRequirements: ['Industry recognition', 'Major project leadership', 'Innovation breakthrough']
    },
    benefits: [
      'Lifetime platform access',
      'Research collaboration network',
      'Annual innovation award eligibility',
      'Platform advisory board consideration',
      'Legacy project immortalization'
    ],
    rarity: 'epic'
  },
  {
    id: 'mythic',
    name: 'Mythic',
    displayName: 'Mythic Visionary',
    description: 'Transcendent minds who reshape the very fabric of our digital reality',
    icon: Gem,
    color: '#EC4899',
    gradient: 'from-pink-400 to-rose-600',
    requirements: {
      minPoints: 15000,
      minContributions: 500,
      minYearsActive: 5,
      specialRequirements: [
        'Revolutionary breakthrough',
        'Global impact achievement',
        'Mentored 100+ innovators',
        'Platform transformation contribution'
      ]
    },
    benefits: [
      'Platform co-evolution rights',
      'Personal research lab access',
      'Global speaking circuit inclusion',
      'Next-gen platform design input',
      'Immortal digital legacy creation',
      'Exclusive universe expansion access'
    ],
    rarity: 'mythic'
  },
  {
    id: 'halloffame',
    name: 'Hall of Fame',
    displayName: 'Hall of Fame Immortal',
    description: 'Eternally honored for paradigm-shifting contributions to humanity',
    icon: Trophy,
    color: '#FFD700',
    gradient: 'from-yellow-400 to-amber-500',
    requirements: {
      minPoints: 50000,
      minContributions: 1000,
      minYearsActive: 10,
      specialRequirements: [
        'Paradigm-shifting innovation',
        'Global civilization impact',
        'Mentored 1000+ individuals',
        'Created lasting institutional change',
        'Nobel-level contribution equivalent'
      ]
    },
    benefits: [
      'Eternal platform recognition',
      'Personal digital monument',
      'Universal access to all systems',
      'Personal AI assistant integration',
      'Quantum research facility access',
      'Galactic expansion board seat',
      'Immortal digital consciousness preservation'
    ],
    rarity: 'legendary'
  }
]

export function getTierById(tierId: string): BlackbirdTier | undefined {
  return BLACKBIRD_TIERS.find(tier => tier.id === tierId)
}

export function getUserTier(userStats: {
  points: number
  contributions: number
  yearsActive: number
  specialAchievements: string[]
}): BlackbirdTier {
  // Start from highest tier and work down
  for (let i = BLACKBIRD_TIERS.length - 1; i >= 0; i--) {
    const tier = BLACKBIRD_TIERS[i]
    const req = tier.requirements
    
    // Check basic requirements
    if (userStats.points >= req.minPoints &&
        userStats.contributions >= (req.minContributions || 0) &&
        userStats.yearsActive >= (req.minYearsActive || 0)) {
      
      // Check special requirements if they exist
      if (req.specialRequirements && req.specialRequirements.length > 0) {
        const hasSpecialReqs = req.specialRequirements.some(requirement =>
          userStats.specialAchievements.some(achievement =>
            achievement.toLowerCase().includes(requirement.toLowerCase())
          )
        )
        if (hasSpecialReqs) {
          return tier
        }
      } else {
        return tier
      }
    }
  }
  
  // Default to first tier if no requirements met
  return BLACKBIRD_TIERS[0]
}

export function getNextTier(currentTier: BlackbirdTier): BlackbirdTier | null {
  const currentIndex = BLACKBIRD_TIERS.findIndex(tier => tier.id === currentTier.id)
  if (currentIndex === -1 || currentIndex === BLACKBIRD_TIERS.length - 1) {
    return null
  }
  return BLACKBIRD_TIERS[currentIndex + 1]
}

export function calculateProgressToNextTier(
  userStats: {
    points: number
    contributions: number
    yearsActive: number
  },
  currentTier: BlackbirdTier,
  nextTier: BlackbirdTier | null
): number {
  if (!nextTier) return 100
  
  const req = nextTier.requirements
  const pointsProgress = Math.min(userStats.points / req.minPoints, 1)
  const contributionsProgress = Math.min(
    userStats.contributions / (req.minContributions || 1), 1
  )
  const yearsProgress = Math.min(
    userStats.yearsActive / (req.minYearsActive || 1), 1
  )
  
  return Math.min((pointsProgress + contributionsProgress + yearsProgress) / 3 * 100, 100)
} 