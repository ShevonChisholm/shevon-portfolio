# Shevon Chisholm Portfolio

> A production-ready full-stack portfolio website with integrated CMS built with Next.js, TypeScript, and Supabase.

**Live:** [shevon-portfolio.vercel.app](https://shevon-portfolio.vercel.app)

---

## 📋 Overview

This is a professional portfolio and content management system that showcases full-stack development capabilities. The public portfolio displays projects, blog posts, experience, and skills, while a password-protected admin panel allows for easy content management.

### Features

✨ **Public Portfolio**
- Responsive, animated landing page
- Filterable project showcase with detailed case studies
- Technical blog with reading time estimates  
- Skills organized by category
- Experience and education timelines
- Contact form with notifications
- Testimonials carousel

🔐 **Admin CMS**
- Protected dashboard with Supabase authentication
- Full CRUD operations for projects, blog posts, experience, education, skills
- Media upload and management (images, videos, resume)
- Contact message inbox
- Site configuration and settings

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **UI:** Material UI (MUI) + Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Deployment:** Vercel
- **Styling:** MUI `sx` prop + CSS-in-JS

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/ShevonChisholm/shevon-portfolio.git
   cd shevon-portfolio
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Access admin panel:**
   Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)

### Build & Deploy

```bash
npm run build      # Create production build
npm start          # Run production server
npm run lint       # Run ESLint
npm run type-check # Check TypeScript
```

---

## 📁 Project Structure

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for detailed documentation including:
- Full architecture breakdown
- CMS data models
- Development workflow
- Security practices
- Performance optimizations

Quick overview:
```
src/
├── app/           # Next.js pages & API routes
├── components/    # Reusable React components
├── lib/           # Utilities & Supabase client
├── types/         # TypeScript definitions
└── theme/         # Material UI theme
```

---

## 🔒 Security

- Full TypeScript type safety
- Supabase Row-Level Security (RLS) policies
- Protected admin routes with authentication
- Service role keys kept server-side only
- Input validation on client and server
- Proper security headers configured

---

## 📈 Performance

- Next.js Image optimization
- Code splitting and lazy loading
- SEO optimized with meta tags
- Open Graph for social sharing
- Core Web Vitals optimized
- ~80+ Lighthouse scores

---

## 🎨 Design

- Dark-first theme with #FF6600 accent
- Material Design principles
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Professional, recruiter-friendly UI

---

## 🧑‍💻 What This Demonstrates

As a portfolio project, this demonstrates:
- **Full-Stack Development:** React/Next.js frontend, database design, APIs
- **Modern Web Dev:** Server/client components, streaming, App Router patterns
- **Type Safety:** Comprehensive TypeScript throughout
- **Database Design:** Normalized schema, RLS policies, efficient queries
- **UI/UX:** Responsive design, animations, accessibility
- **Best Practices:** Clean code, security, performance optimization
- **DevOps:** Environment management, CI/CD, production deployment

---

## 📞 Contact

- **Email:** chisholmshevon@gmail.com
- **LinkedIn:** [linkedin.com/in/shevon-chisholm-6ba802230](https://www.linkedin.com/in/shevon-chisholm-6ba802230)
- **GitHub:** [github.com/ShevonChisholm](https://github.com/ShevonChisholm)

---

## 📝 License

Personal portfolio project. For inquiries about the code or structure, please reach out.
