#  Blackbird Portal

A comprehensive full-stack Next.js web portal designed for tech-oriented communities. Built with modern technologies and a modular architecture for scalability and extensibility.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-cyan)
![MongoDB](https://img.shields.io/badge/MongoDB-7.6-green)

##  Features

###  Core Modules
- **AI Tools & Experiments** - Machine learning models, AI experiments, and automation
- **Robotics & Engineering** - Hardware projects, robotics development, and engineering logs
- **Scientific Community** - Discussion forums for research and collaboration
- **University Projects** - Academic projects, research papers, and coursework
- **Competitions & Events** - Hackathons, coding competitions, and challenges
- **Training Programs** - Physical fitness and military training tracking
- **Language Learning** - Language resources and progress tracking
- **Secure Archives** - Encrypted file storage and historical records
- **Admin Panel** - System administration and user management

###  Technical Features
- **Modern UI/UX** - Built with Tailwind CSS and ShadCN UI components
- **Responsive Design** - Optimized for mobile and desktop
- **Authentication** - NextAuth.js with MongoDB integration
- **Database** - MongoDB with Mongoose ODM
- **Role-Based Access** - Admin, moderator, user, and guest roles
- **Dark Mode** - System-aware theme switching
- **Animations** - Framer Motion and GSAP integration
- **Type Safety** - Full TypeScript implementation
- **Session Management** - Secure session handling with NextAuth

##  Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js + MongoDB Adapter
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion + GSAP
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Icons**: Lucide React

##  Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier available) or local MongoDB installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/blackbird-portal.git
cd blackbird-portal
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the environment template and fill in your values:
```bash
cp .env.local.example .env.local
```

### 4. MongoDB Setup

#### Using MongoDB Atlas (Recommended)
1. Go to [mongodb.com](https://mongodb.com)
2. Create a free MongoDB Atlas account
3. Create a new cluster
4. Get your connection string from the "Connect" button
5. Replace `<username>`, `<password>`, and `<cluster-url>` with your credentials

#### Using Local MongoDB
If you prefer to run MongoDB locally:
```bash
# Install MongoDB Community Edition
# For macOS with Homebrew:
brew install mongodb-community

# For Ubuntu:
sudo apt-get install mongodb

# Start MongoDB service
sudo service mongod start
```

#### Database Setup
After configuring your MongoDB connection, run the setup script:
```bash
npm run setup-db
```

This will:
- Create the necessary collections and indexes
- Set up a default admin user
- Configure the database schema

### 5. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://Avestami:@Amir@7270@blackbird.3qpqiyp.mongodb.net/?retryWrites=true&w=majority&appName=blackbird
DATABASE_URL=mongodb+srv://Avestami:@Amir@7270@blackbird.3qpqiyp.mongodb.net/?retryWrites=true&w=majority&appName=blackbird

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production

# Security
CSRF_SECRET=your-csrf-secret-change-in-production

# Optional: OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=development
```

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Project Structure

```
blackbird-portal/
├── app/                    # Next.js 14 App Router
│   ├── (public)/          # Public routes group
│   ├── ai/                # AI Tools module
│   ├── robotics/          # Robotics module
│   ├── forum/             # Community forum
│   ├── projects/          # University projects
│   ├── competitions/      # Competitions & events
│   ├── training/          # Training programs
│   ├── languages/         # Language learning
│   ├── archives/          # Secure archives
│   ├── admin/             # Admin panel
│   ├── dashboard/         # User dashboard
│   ├── auth/              # Authentication pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # ShadCN UI components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── mongodb.ts        # MongoDB client and types
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
├── constants/            # App constants
├── hooks/                # Custom React hooks
├── styles/               # Global styles
└── public/               # Static assets
```

##  Usage

### Adding New Modules
1. Create a new directory in `app/`
2. Add the module to `PORTAL_MODULES` in `constants/index.ts`
3. Create necessary pages and components
4. Update navigation if needed

### Customizing Themes
- Modify CSS variables in `styles/globals.css`
- Update Tailwind config in `tailwind.config.js`
- Add new color schemes to the theme system

### Setting Up Authentication
1. Configure OAuth providers in their respective developer consoles
2. Add provider credentials to environment variables
3. Update `lib/auth.ts` with new providers
4. The MongoDB adapter will automatically handle user sessions

##  Security Features

- **Secure Authentication** - NextAuth.js with MongoDB adapter
- **Role-Based Access Control** - Granular permission system
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Zod schema validation
- **CSRF Protection** - NextAuth.js built-in protection
- **Secure Headers** - Next.js security headers
- **Database Indexes** - Optimized queries with proper indexing

##  Module Documentation

### AI Tools Module (`/ai`)
- Chat interface with AI assistants
- Model training and deployment
- Data analysis tools
- Workflow automation

### Robotics Module (`/robotics`)
- Project documentation and logs
- CAD file management
- Hardware specifications
- Build guides and tutorials

### Community Forum (`/forum`)
- Threaded discussions
- Category-based organization
- Real-time updates
- User reputation system

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

For support, email support@blackbird-portal.com or join our [Discord community](https://discord.gg/blackbird).

---

Built with Love by the Blackbird Team 
