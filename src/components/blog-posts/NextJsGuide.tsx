"use client";

import { Typography } from "@mui/material";
import CodeBlock from "@/components/CodeBlock";

export default function NextJsGuide() {
  return (
    <>
      <Typography variant="h2">Introduction</Typography>
      <Typography>
        Next.js has become one of the most popular React frameworks for building
        modern web applications. In this guide, we&apos;ll explore the key
        features that make Next.js an excellent choice for your next project and
        walk through setting up a basic application.
      </Typography>

      <Typography variant="h2">Key Features of Next.js</Typography>
      <Typography component="ul">
        <li>Server-side rendering (SSR) and static site generation (SSG)</li>
        <li>File-based routing system</li>
        <li>API routes for backend functionality</li>
        <li>Built-in image optimization</li>
        <li>Automatic code splitting</li>
        <li>Hot module replacement during development</li>
      </Typography>

      <Typography variant="h2">Setting Up a Next.js Project</Typography>
      <Typography>
        Let&apos;s start by creating a new Next.js project. Open your terminal
        and run:
      </Typography>
      <CodeBlock language="bash">
        {`npx create-next-app@latest my-next-app
cd my-next-app
npm run dev`}
      </CodeBlock>
      <Typography>
        This will create a new Next.js project with TypeScript, ESLint, and
        Tailwind CSS configuration. The development server will start at
        http://localhost:3000.
      </Typography>

      <Typography variant="h2">Project Structure</Typography>
      <Typography>
        A typical Next.js project structure looks like this:
      </Typography>
      <CodeBlock language="plaintext">
        {`my-next-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
│   └── assets/
├── components/
├── package.json
└── next.config.js`}
      </CodeBlock>

      <Typography variant="h2">Creating Pages and Routes</Typography>
      <Typography>
        Next.js 13+ uses the App Router, which is based on the file-system.
        Here&apos;s how to create basic routes:
      </Typography>
      <CodeBlock language="typescript">
        {`// app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
    </main>
  );
}`}
      </CodeBlock>
      <Typography>
        To create nested routes, simply create folders in the app directory:
      </Typography>
      <CodeBlock language="plaintext">
        {`app/
├── page.tsx          // → /
├── about/
│   └── page.tsx      // → /about
└── blog/
    └── [slug]/
        └── page.tsx  // → /blog/post-1, /blog/post-2`}
      </CodeBlock>

      <Typography variant="h2">Data Fetching</Typography>
      <Typography>
        Next.js provides several ways to fetch data in your applications:
      </Typography>
      <CodeBlock language="typescript">
        {`// Server Component
async function getData() {
  const res = await fetch('https://api.example.com/data');
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{/* Render data here */}</main>;
}`}
      </CodeBlock>

      <Typography variant="h2">API Routes</Typography>
      <Typography>
        API routes allow you to build backend endpoints within your Next.js app.
      </Typography>
      <CodeBlock language="typescript">
        {`// pages/api/hello.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello from Next.js API Route!' });
}`}
      </CodeBlock>

      <Typography variant="h2">Image Optimization</Typography>
      <Typography>
        The Next.js Image component automatically optimizes images for size and
        performance.
      </Typography>
      <CodeBlock language="typescript">
        {`import Image from 'next/image';

export default function Avatar() {
  return (
    <Image
      src="/me.png"
      alt="My Avatar"
      width={200}
      height={200}
      placeholder="blur"
    />
  );
}`}
      </CodeBlock>

      <Typography variant="h2">Middleware</Typography>
      <Typography>
        Middleware runs before requests are processed, useful for
        authentication, redirects, and rewriting URLs.
      </Typography>
      <CodeBlock language="typescript">
        {`// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    // perform logic
  }
  return NextResponse.next();
}`}
      </CodeBlock>

      <Typography variant="h2">
        Incremental Static Regeneration (ISR)
      </Typography>
      <Typography>
        ISR allows you to update static pages after build without a full
        rebuild.
      </Typography>
      <CodeBlock language="typescript">
        {`export async function getStaticProps() {
  const data = await fetchData();
  return {
    props: { data },
    revalidate: 60, // Revalidate every 60 seconds
  };
}`}
      </CodeBlock>

      <Typography variant="h2">Environment Variables</Typography>
      <Typography>
        Store sensitive config in .env.local and prefix public vars with
        NEXT_PUBLIC_.
      </Typography>
      <CodeBlock language="plaintext">
        {`// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgres://user:pass@localhost:5432/db`}
      </CodeBlock>

      <Typography variant="h2">Authentication with NextAuth</Typography>
      <Typography>
        NextAuth makes adding authentication and OAuth providers
        straightforward.
      </Typography>
      <CodeBlock language="typescript">
        {`import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
});`}
      </CodeBlock>

      <Typography variant="h2">Internationalization (i18n)</Typography>
      <Typography>
        Enable locale routing with built-in i18n support in next.config.js.
      </Typography>
      <CodeBlock language="javascript">
        {`// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'es'],
    defaultLocale: 'en',
  },
};`}
      </CodeBlock>

      <Typography variant="h2">Performance Optimization</Typography>
      <Typography>
        Monitor Lighthouse scores, use React Profiler, and analyze bundle size
        via webpack-bundle-analyzer.
      </Typography>

      <Typography variant="h2">Deployment to Vercel</Typography>
      <Typography>
        Deploy your Next.js app seamlessly with Vercel CLI or through Git
        integration.
      </Typography>
      <CodeBlock language="bash">
        {`npm install -g vercel
vercel login
vercel --prod`}
      </CodeBlock>

      <Typography variant="h2">Conclusion</Typography>
      <Typography>
        Next.js combines powerful features with an easy developer experience.
        Explore these sections to build scalable, high-performance web apps.
      </Typography>
    </>
  );
}
