import { PortalModule, NavItem } from '@/types'

// Portal modules configuration
export const PORTAL_MODULES: PortalModule[] = [
  {
    id: 'ai',
    title: 'AI Tools & Experiments',
    description: 'Machine learning models, AI experiments, and intelligent automation tools',
    href: '/ai',
    icon: 'Brain',
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
    features: ['GPT Integration', 'Model Training', 'Data Analysis', 'Automation'],
    status: 'active',
  },
  {
    id: 'robotics',
    title: 'Robotics & Engineering',
    description: 'Hardware projects, robotics development, and engineering logs',
    href: '/robotics',
    icon: 'Bot',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    features: ['Project Logs', 'CAD Files', 'Hardware Specs', 'Build Guides'],
    status: 'active',
  },
  {
    id: 'forum',
    title: 'Scientific Community',
    description: 'Discussion forums for research, collaboration, and knowledge sharing',
    href: '/forum',
    icon: 'MessageSquare',
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
    features: ['Discussions', 'Research Papers', 'Collaboration', 'Peer Review'],
    status: 'active',
  },
  {
    id: 'projects',
    title: 'University Projects',
    description: 'Academic projects, research papers, and university coursework',
    href: '/projects',
    icon: 'GraduationCap',
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    features: ['Project Portfolio', 'Research Papers', 'Code Repositories', 'Documentation'],
    status: 'active',
  },
  {
    id: 'competitions',
    title: 'Competitions & Events',
    description: 'Hackathons, coding competitions, and technical challenges',
    href: '/competitions',
    icon: 'Trophy',
    color: 'from-yellow-500 to-orange-500',
    gradient: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    features: ['Event Calendar', 'Team Formation', 'Results Tracking', 'Leaderboards'],
    status: 'active',
  },
  {
    id: 'training',
    title: 'Training Programs',
    description: 'Physical fitness, military training, and shooting sports tracking',
    href: '/training',
    icon: 'Target',
    color: 'from-red-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-red-500 to-rose-500',
    features: ['Workout Plans', 'Progress Tracking', 'Performance Analytics', 'Goal Setting'],
    status: 'beta',
    requiredRole: 'member',
  },
  {
    id: 'languages',
    title: 'Language Learning',
    description: 'Language learning resources, practice tools, and progress tracking',
    href: '/languages',
    icon: 'Languages',
    color: 'from-teal-500 to-green-500',
    gradient: 'bg-gradient-to-br from-teal-500 to-green-500',
    features: ['Study Materials', 'Practice Tests', 'Progress Tracking', 'Language Exchange'],
    status: 'beta',
  },
  {
    id: 'archives',
    title: 'Secure Archives',
    description: 'Encrypted file storage, past events, and historical records',
    href: '/archives',
    icon: 'Archive',
    color: 'from-gray-500 to-slate-600',
    gradient: 'bg-gradient-to-br from-gray-500 to-slate-600',
    features: ['Encrypted Storage', 'Version Control', 'Access Logs', 'Backup Management'],
    status: 'active',
    requiredRole: 'member',
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    description: 'System administration, user management, and platform configuration',
    href: '/admin',
    icon: 'Settings',
    color: 'from-slate-600 to-gray-800',
    gradient: 'bg-gradient-to-br from-slate-600 to-gray-800',
    features: ['User Management', 'System Monitoring', 'Content Moderation', 'Analytics'],
    status: 'active',
    requiredRole: 'admin',
  },
]

// Main navigation items
export const MAIN_NAV: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'All Modules',
    href: '/',
    icon: 'Grid3X3',
  },
  {
    title: 'My Profile',
    href: '/users/profile',
    icon: 'User',
  },
]

// Footer navigation
export const FOOTER_NAV = {
  main: [
    { title: 'About', href: '/about' },
    { title: 'Privacy', href: '/privacy' },
    { title: 'Terms', href: '/terms' },
    { title: 'Contact', href: '/contact' },
  ],
  social: [
    { title: 'GitHub', href: 'https://github.com', external: true },
    { title: 'Twitter', href: 'https://twitter.com', external: true },
    { title: 'LinkedIn', href: 'https://linkedin.com', external: true },
  ],
}

// Site configuration
export const SITE_CONFIG = {
  name: 'Blackbird Portal',
  description: 'A comprehensive digital infrastructure for tech-oriented communities',
  url: 'https://blackbird-portal.com',
  version: '1.0.0',
  keywords: ['portal', 'tech', 'community', 'research', 'collaboration'],
  author: 'Blackbird Team',
  social: {
    github: 'https://github.com/blackbird-portal',
    twitter: 'https://twitter.com/blackbird_portal',
  },
}

// Theme configuration
export const THEME_CONFIG = {
  defaultTheme: 'system' as const,
  themes: ['light', 'dark', 'system'] as const,
}

// API endpoints
export const API_ROUTES = {
  auth: {
    signIn: '/api/auth/signin',
    signUp: '/api/auth/signup',
    signOut: '/api/auth/signout',
    profile: '/api/auth/profile',
  },
  users: {
    profile: '/api/users/profile',
    settings: '/api/users/settings',
  },
  upload: {
    file: '/api/upload',
    image: '/api/upload/image',
  },
} as const 