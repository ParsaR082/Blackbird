# Blackbird Portal – Project Structure & Theme System

## Overview

Blackbird Portal is a modern portal built on Next.js 14 (App Router) designed for tech-oriented and educational communities. It features diverse modules such as Events, University, Hall of Fame, Product Playground, Learning Roadmaps, User Dashboard, and Admin Panel.

---

## Folder Structure & Modules

```
Blackbird Portal/
├── app/                    # Next.js pages & routing (App Router)
│   ├── (public)/           # Public pages (landing, etc.)
│   ├── admin/              # Admin panel
│   ├── ai/                 # AI tools
│   ├── api/                # Backend APIs
│   ├── assistant/          # Smart assistant
│   ├── auth/               # Authentication
│   ├── calendar/           # Calendar
│   ├── dashboard/          # User dashboard
│   ├── events/             # Events system
│   ├── forum/              # Forum
│   ├── games/              # Games
│   ├── hall-of-fame/       # Hall of Fame
│   ├── product-playground/ # Product store
│   ├── roadmaps/           # Learning roadmaps
│   ├── robotics/           # Robotics
│   ├── university/         # University system
│   ├── users/              # User profiles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main landing page
├── components/             # Reusable components
│   ├── layout/             # Layout elements (header, nav, etc.)
│   ├── ui/                 # UI elements
│   ├── auth/               # Auth components
│   └── forms/              # Forms
├── contexts/               # React contexts (theme, auth, etc.)
├── styles/                 # Global styles (Tailwind + CSS vars)
├── constants/              # Module and navigation configs
├── lib/                    # Utility functions and models
├── public/                 # Static files (logo, ...)
└── ...                     # Other folders (hooks, scripts, docs, ...)
```

---

## Landing Page Structure

- **Path:** `/` or `/app/page.tsx`
- **Main Component:** `HomePageContent`
- **Features:**
  - Animated background (BackgroundNodes)
  - Central logo (LogoBird) with glow and animation
  - Circular navigation (CategoryRing) with main categories:
    - University
    - Hall of Fame
    - Games
    - Product Playground
    - Roadmaps
    - Events
    - Assistant
  - Mobile: grid navigation toggled by logo tap
  - Desktop: circular navigation toggled by logo click
  - Dynamic theme (light/dark) based on context and localStorage

---

## Theme System

- **Context:**  
  `contexts/theme-context.tsx`  
  - ThemeProvider wraps the entire app.
  - Default theme: dark
  - User theme is saved in localStorage.
  - CSS variables (`--bg-color`, `--text-color`, ...) are updated based on theme.
  - Theme switcher is available in the header and mobile menu.

- **Styles:**  
  `styles/globals.css`  
  - CSS variables for each theme (`:root`, `.light`, `.dark`)
  - Smooth transitions for theme changes
  - Uses Tailwind CSS and utility classes

- **Theme Switching:**  
  - By clicking the sun/moon icon in the header or mobile menu
  - The selected theme is applied as a class on the `<html>` tag

---

## Header & Navigation Structure

- **Header Component:** `components/layout/header.tsx`
  - Site logo (HeaderLogo)
  - Desktop navigation (DesktopNavigation)
  - Search (SearchBar)
  - User actions (UserActions: theme, notifications, profile)
  - Mobile menu (MobileMenu) with navigation and actions

- **Main Navigation:**
  - Dashboard
  - All Modules (link to landing)
  - My Profile
  - (If admin) Admin Dashboard

- **Main Categories (CategoryRing):**
  - University
  - Hall of Fame
  - Games
  - Product Playground
  - Roadmaps
  - Events
  - Assistant

---

## Example Module Structure

- **University:** Course management, enrollment, assignments, study planning, progress tracking
- **Hall of Fame:** User ranking and achievement system
- **Product Playground:** Product store and purchase management
- **Roadmaps:** Learning roadmaps with levels, milestones, and challenges
- **Events:** Event management and registration
- **Assistant:** Smart assistant and AI tools

---

## Technical Notes

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Variables
- **Animation:** Framer Motion
- **Database:** MongoDB
- **Authentication:** Custom (context-based)
- **Theme:** Light/Dark (switchable)
- **Components:** Modular and reusable
- **Responsive:** Fully mobile-friendly

---

## Theme System Summary

- Theme is managed via React context and CSS variables.
- User theme is saved in localStorage and set on `<html>`.
- Color and background variables differ per theme.
- Theme switcher is accessible in header and mobile menu.
- All pages and components use CSS variables for color and background.

---

This file provides a complete, clear explanation of the project structure and theme system for any developer or model. For more details on any module or page, just ask. 