# Shevon Chisholm Portfolio

A production-ready full-stack portfolio website with an integrated CMS. Built with Next.js, TypeScript, and Supabase, this project showcases professional work while providing a powerful admin panel for content management.

## 🎯 Project Purpose

This is a personal portfolio and content management system designed to:
- Display a professional portfolio with projects, blog posts, and professional experience
- Provide a user-friendly admin interface to manage portfolio content
- Demonstrate full-stack development skills and best practices
- Serve as a platform for technical blogging and case studies

**Live Site:** https://shevon-portfolio.vercel.app

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend & Framework**
- **Next.js 15+** - React framework with App Router for server/client components
- **React 18+** - UI library
- **TypeScript** - Type-safe development

**UI & Styling**
- **Material UI (MUI)** - Component library for professional design
- **Framer Motion** - Animation library for smooth transitions
- **CSS-in-JS** - MUI's `sx` prop for styling

**Backend & Database**
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication (email/password, OAuth)
  - File storage (project images, videos, resume)
  - Row-Level Security (RLS) for data protection

**Other Libraries**
- **MDX** - Support for blog posts with embedded code blocks
- **Resend** - Email service for contact notifications

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home page with all sections
│   ├── layout.tsx                # Root layout with theme/motion setup
│   ├── globals.css               # Global styles
│   ├── admin/                    # Admin dashboard (protected routes)
│   │   ├── dashboard/            # Main admin dashboard
│   │   ├── projects/             # Project management
│   │   ├── blog/                 # Blog post management
│   │   ├── experience/           # Experience management
│   │   ├── education/            # Education management
│   │   ├── skills/               # Skills management
│   │   ├── messages/             # Contact messages
│   │   ├── testimonials/         # Testimonials management
│   │   ├── settings/             # Site settings
│   │   └── login/                # Admin login page
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── contact/              # Contact form submission
│   │   └── testimonials/         # Testimonial endpoints
│   ├── blog/                     # Blog pages
│   ├── projects/                 # Project detail pages
│   └── resume/                   # Resume page
│
├── components/                   # Reusable React components
│   ├── Hero/                     # Landing section
│   ├── About/                    # About section
│   ├── Projects/                 # Projects showcase
│   ├── Blog/                     # Blog section
│   ├── Skills/                   # Skills display
│   ├── Experience/               # Experience timeline
│   ├── Education/                # Education section
│   ├── Contact/                  # Contact form
│   ├── Footer/                   # Footer section
│   ├── admin/                    # Admin-specific components
│   └── ThemeRegistry/            # Material UI theme setup
│
├── lib/                          # Utility functions & services
│   ├── supabase/                 # Supabase client configuration
│   ├── cms/                      # CMS operations
│   │   ├── public-*.ts           # Public data fetching
│   │   ├── admin-*.ts            # Admin CRUD operations
│   │   └── storage.ts            # File upload handling
│   ├── resend/                   # Email sending
│   └── admin/                    # Admin utilities
│
├── types/                        # TypeScript type definitions
│   └── cms.ts                    # CMS data models
│
├── theme/                        # Material UI theme configuration
└── utils/                        # Helper functions

public/                           # Static assets
├── projects/                     # Project preview images
├── blog/                         # Blog-related assets
└── *.svg, *.png                  # Icons and favicons
```

---

## 🎨 Key Features

### Public Portfolio
- **Hero Section** - Eye-catching introduction with core skills and availability status
- **About Section** - Professional background with profile image
- **Projects Showcase** - Filterable project gallery with detailed project pages including:
  - Project showcase carousel
  - Video demonstrations
  - Technical stack display
  - Role and impact descriptions
  - Demo and GitHub links
- **Blog** - Technical articles with reading time estimates
- **Skills** - Organized by category with visual icons
- **Experience & Education** - Timeline view of professional history
- **Contact Form** - Direct messaging capability
- **Testimonials** - Client feedback carousel
- **Resume** - Downloadable resume

### Admin CMS
- **Protected Dashboard** - Supabase authentication required
- **Project Management** - Create, edit, order featured projects
- **Blog Management** - Draft and publish technical articles
- **Content Organization** - Manage experience, education, skills, testimonials
- **Message Inbox** - Review contact form submissions
- **Site Settings** - Update about section, contact info, resume
- **Media Upload** - Integrated file storage for images and videos

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Environment variables configured

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd shevon-portfolio
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

4. **Access admin panel:**
   Navigate to http://localhost:3000/admin/login

### Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Best Practices

- **TypeScript** - Full type safety throughout the application
- **Row-Level Security (RLS)** - Supabase RLS policies protect admin-only content
- **Protected Routes** - Admin pages require authentication
- **Environment Variables** - Sensitive keys managed through .env.local
- **Service Role Keys** - Never exposed in frontend code
- **Input Validation** - Form validation on both client and server
- **CORS & Headers** - Proper security headers configured

---

## 📊 CMS Data Model

### Core Content Types
- **Projects** - Portfolio projects with showcase items, videos, and technical details
- **Blog Posts** - Technical articles with SEO optimization
- **Experience** - Work history with descriptions and dates
- **Education** - Credentials and learning milestones
- **Skills** - Organized by categories (Frontend, Backend, Cloud, etc.)
- **Contact Messages** - Form submissions from visitors
- **Testimonials** - Client feedback and reviews
- **Site Settings** - Global configuration (resume, contact info, bio)

---

## 🎨 Design System

### Color Scheme
- **Primary Accent:** #FF6600 (Orange)
- **Dark Theme:** Material UI dark mode
- **Text Colors:** High contrast for readability
- **Borders & Dividers:** Subtle white with alpha transparency

### Typography
- **Headings:** Montserrat font (bold, 800 weight)
- **Body:** Roboto font (regular weight)
- **UI Labels:** Mixed case with appropriate weights

### Component Patterns
- **Cards:** Rounded borders with subtle shadows
- **Buttons:** Filled or outlined variants
- **Spacing:** Consistent 8px grid system
- **Responsive:** Mobile-first design approach

---

## 🔧 Development Workflow

### Common Tasks

**Add a New Project:**
1. Log in to admin dashboard
2. Navigate to Projects
3. Fill in project details, images, videos, and technical focus
4. Publish when ready

**Write a Blog Post:**
1. Go to Blog Posts in admin
2. Write content (supports MDX)
3. Upload cover image
4. Schedule publication date
5. Publish

**Update Site Settings:**
1. Navigate to Settings in admin
2. Update about section, contact info, or resume
3. Changes reflected immediately on public site

### Testing
```bash
npm run lint      # ESLint checks
npm run type-check # TypeScript compilation
npm run build     # Production build test
```

---

## 📈 Performance & SEO

- **Next.js Optimizations** - Image optimization, code splitting, lazy loading
- **Meta Tags** - Proper SEO metadata for all pages
- **Open Graph** - Social media preview cards
- **Sitemap & Robots** - Search engine discovery
- **Core Web Vitals** - Optimized for fast loading and interactivity

---

## 🚢 Deployment

Deployed on **Vercel** with:
- Automatic deployments on main branch push
- Preview deployments for pull requests
- Zero-config Next.js deployment

---

## 📚 Content Structure

### Portfolio Categories
- **Web Apps** - Full-stack web applications
- **Mobile Apps** - React Native projects
- **Technical Focus Areas** - APIs, Payments, Auth, Cloud, etc.

### Blog Topics
- Backend development practices
- Next.js and React optimization
- React Native and Expo
- TypeScript patterns

---

## 🤝 For Recruiters & Interested Users

This project demonstrates:
- **Full-Stack Capabilities** - Frontend React/Next.js, backend Node.js/APIs, database design
- **Production-Ready Code** - TypeScript, error handling, security best practices
- **Modern Web Development** - App Router, server/client components, streaming
- **Database Design** - Normalized schema, RLS policies, efficient queries
- **UI/UX Skills** - Responsive design, accessibility, animations
- **DevOps** - Environment management, CI/CD deployment

---

## 📝 License

This is a personal portfolio project.

---

## 📧 Contact

For inquiries, use the contact form on the portfolio or reach out directly:
- **Email:** chisholmshevon@gmail.com
- **LinkedIn:** linkedin.com/in/shevon-chisholm-6ba802230
- **GitHub:** github.com/ShevonChisholm
