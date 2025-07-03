'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PORTAL_MODULES } from '@/constants'
import { ArrowRight, ExternalLink } from 'lucide-react'

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Blackbird Portal
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A comprehensive digital infrastructure for tech-oriented communities.
              Explore our modular platform designed for research, collaboration, and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portal Modules Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Our Modules
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each module is designed as a specialized workspace for different aspects of your projects and research.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTAL_MODULES.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                onHoverStart={() => setHoveredCard(module.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="h-full"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-3 rounded-lg ${module.gradient} text-white`}>
                        <div className="w-6 h-6 font-bold">
                          {module.icon.slice(0, 2)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={module.status === 'active' ? 'success' : module.status === 'beta' ? 'warning' : 'secondary'}
                        >
                          {module.status}
                        </Badge>
                        {module.requiredRole && (
                          <Badge variant="outline" className="text-xs">
                            {module.requiredRole}+
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {module.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {module.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{module.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={module.href} className="w-full">
                      <Button 
                        className="w-full group-hover:bg-primary/90 transition-colors"
                        variant={hoveredCard === module.id ? "default" : "outline"}
                      >
                        Explore Module
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-background/50 backdrop-blur">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-primary">9</div>
              <div className="text-muted-foreground">Active Modules</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Projects</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="text-3xl font-bold text-primary">1.2K+</div>
              <div className="text-muted-foreground">Community Members</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
} 