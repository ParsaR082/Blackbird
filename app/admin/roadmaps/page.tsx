export const dynamic = 'force-dynamic';
export const revalidate = 0;

// app/admin/roadmaps/page.tsx
'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import BackgroundNodes from '@/components/BackgroundNodes';

// Dynamically import the new RoadmapsManager to avoid hydration issues
const RoadmapsManager = dynamic(() => import('../components/RoadmapsManager'), { ssr: false });

export default function AdminRoadmapsPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="fixed inset-0 transition-colors duration-300" style={{ 
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
          : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
      }} />
      <div className="fixed inset-0" style={{
        background: theme === 'light'
          ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
          : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
      }} />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 container mx-auto pt-24 pb-8 px-4">
        <RoadmapsManager />
      </div>
    </div>
  );
} 