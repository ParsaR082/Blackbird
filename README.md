#  Blackbird Portal

A comprehensive full-stack Next.js web portal designed for tech-oriented communities. Built with modern technologies and a modular architecture for scalability and extensibility.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-cyan)
![MongoDB](https://img.shields.io/badge/MongoDB-7.6-green)

##  Features

###  Core Modules
- **Events System** - Event management, registration, and attendance tracking
- **Product Playground** - Product showcase, purchasing, and management
- **Hall of Fame** - Recognition system for outstanding achievements
- **University System** - Academic records, courses, assignments, and progress tracking
- **Dashboard** - Personalized user dashboard with activity tracking
- **Admin Panel** - Comprehensive system administration and management

###  Technical Features
- **Modern UI/UX** - Built with Tailwind CSS and custom UI components
- **Responsive Design** - Optimized for mobile and desktop
- **Authentication** - Custom authentication system with MongoDB integration
- **Database** - MongoDB with direct connection
- **Role-Based Access** - Admin and user roles
- **Dark Mode** - System-aware theme switching
- **Animations** - Framer Motion integration
- **Type Safety** - Full TypeScript implementation
- **Session Management** - Secure session handling

##  Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: Custom authentication system
- **Styling**: Tailwind CSS + Custom UI components
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Icons**: Lucide React

##  Installation

### Prerequisites
- Node.js 18+ 
- npm
- MongoDB Atlas account (free tier available) or local MongoDB installation

### 1. Clone the Repository
```bash
git clone https://github.com/Avestami/Blackbird.git
cd Blackbird
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
DATABASE_URL=your-mongodb-connection-string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production

# Security
CSRF_SECRET=your-csrf-secret-change-in-production

# Environment
NODE_ENV=development
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Project Structure

```
Blackbird Portal/
├── app/                    # Next.js 14 App Router
│   ├── (public)/          # Public routes group
│   ├── admin/             # Admin panel
│   │   ├── events/        # Event management
│   │   ├── hall-of-fame/  # Hall of Fame management
│   │   ├── products/      # Product management
│   │   ├── purchases/     # Purchase management
│   │   └── university/    # University system management
│   ├── ai/                # AI tools
│   ├── api/               # API routes
│   ├── assistant/         # Assistant interface
│   ├── auth/              # Authentication pages
│   ├── calendar/          # Calendar view
│   ├── dashboard/         # User dashboard
│   ├── events/            # Events system
│   ├── forum/             # Community forum
│   ├── games/             # Games section
│   ├── hall-of-fame/      # Hall of Fame
│   ├── product-playground/# Product playground
│   ├── roadmaps/          # Learning roadmaps
│   ├── robotics/          # Robotics section
│   ├── university/        # University system
│   │   ├── assignments/   # Assignments
│   │   ├── courses/       # Courses
│   │   ├── progress/      # Progress tracking
│   │   └── study-plans/   # Study plans
│   ├── users/             # User profiles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   ├── auth/             # Authentication components
│   └── forms/            # Form components
├── contexts/             # React contexts
├── database/             # Database schemas
├── docs/                 # Documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── models/           # Data models
│   ├── mongodb.ts        # MongoDB client
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma ORM
├── public/               # Static assets
├── scripts/              # Utility scripts
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

##  Module Documentation

### Events System (`/events`)
- Event creation and management
- Registration and attendance tracking
- Calendar integration
- Event archives

### Product Playground (`/product-playground`)
- Product showcase
- Purchase management
- Product details and documentation

### Hall of Fame (`/hall-of-fame`)
- Recognition system for outstanding achievements
- User profiles and achievements

### University System (`/university`)
- Academic records management
- Course enrollment
- Assignment submission and grading
- Progress tracking
- Study plans

### Admin Panel (`/admin`)
- User management
- System configuration
- Content moderation
- Analytics and reporting

## n8n Integration

The Blackbird Portal now includes integration with n8n for advanced AI-powered academic features. These features leverage the DeepSeek R1 large language model through n8n workflows:

1. **Advanced Study Planner**: Creates personalized study plans based on free time slots and exam dates, adding events to the user's calendar
2. **Study Suggestions**: Provides course recommendations based on a student's goals and interests
3. **Smart Feedback Analyzer**: Refines and professionally formats feedback before sending it to instructors

For detailed documentation on the n8n integration, see `docs/N8N_INTEGRATION.md`.

To test the integration, use:
```
npm run test-n8n
```

### Environment Variables

For the n8n integration to work, the following environment variables must be set:
- `BUBOT_WEBHOOK_SECRET`: Shared secret for HMAC signature verification
- `N8N_WEBHOOK_URL`: URL of the n8n webhook endpoint

##  Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [MongoDB](https://mongodb.com/) - Document database
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [ShadCN UI](https://ui.shadcn.com/) - Re-usable components
- [Lucide](https://lucide.dev/) - Beautiful icons

##  Support

For support, email avestanabizadeh@gmail.com.

---

Built with Love by the Blackbird Team 
