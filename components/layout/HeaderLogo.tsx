'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { SITE_CONFIG } from '@/constants'

export function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center space-x-3 group">
      <motion.div 
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-white to-gray-300 text-black shadow-lg"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Zap className="h-5 w-5 font-bold" />
      </motion.div>
      <span className="hidden font-bold text-lg sm:inline-block group-hover:text-white/80 transition-colors">
        {SITE_CONFIG.name}
      </span>
    </Link>
  )
} 