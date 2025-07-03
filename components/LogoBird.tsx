'use client'

import React from 'react'
import { motion } from 'framer-motion'

const LogoBird = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="drop-shadow-2xl"
          animate={{ 
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1, 1.02, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Bird body */}
          <motion.path
            d="M60 45 C70 40, 80 45, 85 55 C85 65, 80 70, 70 75 C65 80, 55 80, 50 75 C45 70, 45 60, 50 50 C52 45, 56 42, 60 45 Z"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Left wing */}
          <motion.path
            d="M50 55 C40 50, 30 52, 25 58 C22 62, 25 66, 30 68 C35 70, 45 68, 50 65"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
            animate={{ 
              d: [
                "M50 55 C40 50, 30 52, 25 58 C22 62, 25 66, 30 68 C35 70, 45 68, 50 65",
                "M50 55 C40 45, 30 47, 25 53 C22 57, 25 61, 30 63 C35 65, 45 63, 50 60",
                "M50 55 C40 50, 30 52, 25 58 C22 62, 25 66, 30 68 C35 70, 45 68, 50 65"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Right wing */}
          <motion.path
            d="M70 55 C80 50, 90 52, 95 58 C98 62, 95 66, 90 68 C85 70, 75 68, 70 65"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
            animate={{ 
              d: [
                "M70 55 C80 50, 90 52, 95 58 C98 62, 95 66, 90 68 C85 70, 75 68, 70 65",
                "M70 55 C80 45, 90 47, 95 53 C98 57, 95 61, 90 63 C85 65, 75 63, 70 60",
                "M70 55 C80 50, 90 52, 95 58 C98 62, 95 66, 90 68 C85 70, 75 68, 70 65"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.1
            }}
          />
          
          {/* Bird head */}
          <motion.circle
            cx="60"
            cy="35"
            r="12"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
            animate={{ 
              r: [12, 13, 12],
              cy: [35, 34, 35]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Bird beak */}
          <motion.path
            d="M60 28 L65 25 L62 30 Z"
            fill="#FFFFFF"
            animate={{ 
              d: [
                "M60 28 L65 25 L62 30 Z",
                "M60 28 L66 24 L62 30 Z",
                "M60 28 L65 25 L62 30 Z"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Bird eye */}
          <motion.circle
            cx="62"
            cy="33"
            r="2"
            fill="#000000"
            animate={{ 
              r: [2, 1, 2],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Tail */}
          <motion.path
            d="M50 75 C45 80, 40 85, 38 90 C36 95, 40 98, 45 95 C50 90, 52 85, 50 80"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
            animate={{ 
              d: [
                "M50 75 C45 80, 40 85, 38 90 C36 95, 40 98, 45 95 C50 90, 52 85, 50 80",
                "M50 75 C45 78, 40 82, 38 87 C36 92, 40 95, 45 92 C50 87, 52 82, 50 77",
                "M50 75 C45 80, 40 85, 38 90 C36 95, 40 98, 45 95 C50 90, 52 85, 50 80"
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          />
        </motion.svg>
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white opacity-20 blur-xl"
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  )
}

export default LogoBird 