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
  return <main>{/* Use data */}</main>;
}`}
      </CodeBlock>

      <Typography variant="h2">Conclusion</Typography>
      <Typography>
        Next.js provides a robust framework for building modern web applications
        with React. Its features like the App Router, server components, and
        built-in optimizations make it an excellent choice for projects of any
        size. Start with the basics covered in this guide and gradually explore
        more advanced features as you build your applications.
      </Typography>
    </>
  );
}
