#  Blackbird Portal

A comprehensive full-stack Next.js web portal designed for tech-oriented communities. Built with modern technologies and a modular architecture for scalability and extensibility.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-cyan)
![Supabase](https://img.shields.io/badge/Supabase-2.38-green)

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
- **Authentication** - NextAuth.js with Supabase integration
- **Real-time Updates** - Supabase real-time subscriptions
- **File Storage** - Supabase Storage for file uploads
- **Role-Based Access** - Admin, moderator, member, and guest roles
- **Dark Mode** - System-aware theme switching
- **Animations** - Framer Motion and GSAP integration
- **Type Safety** - Full TypeScript implementation

##  Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js + Supabase Auth
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion + GSAP
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Icons**: Lucide React

##  Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

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

### 4. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

#### Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'guest' CHECK (role IN ('admin', 'moderator', 'member', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Configure Environment Variables
Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Optional: OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
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
│   ├── supabase.ts       # Supabase client
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
1. Configure OAuth providers in Supabase Auth settings
2. Add provider credentials to environment variables
3. Update `lib/auth.ts` with new providers

##  Security Features

- **Row Level Security** - Database-level security policies
- **Role-Based Access Control** - Granular permission system
- **Input Validation** - Zod schema validation
- **CSRF Protection** - NextAuth.js built-in protection
- **Secure Headers** - Next.js security headers

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
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [ShadCN UI](https://ui.shadcn.com/) - Re-usable components
- [Lucide](https://lucide.dev/) - Beautiful icons

##  Support

For support, email support@blackbird-portal.com or join our [Discord community](https://discord.gg/blackbird).

---

Built with Love by the Blackbird Team 
