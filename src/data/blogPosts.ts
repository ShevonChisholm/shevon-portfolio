export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Building Modern Web Applications with Next.js 14',
    description: 'A comprehensive guide to creating high-performance web applications using Next.js 14, React Server Components, and the App Router.',
    date: '2024-03-15',
    readTime: '8 min read',
    imageUrl: '/blog/nextjs-guide.webp',
    tags: ['Next.js', 'React', 'Performance', 'TypeScript'],
    slug: 'nextjs-guide'
  },
  {
    id: '2',
    title: 'Mastering React Native with Expo',
    description: 'Learn how to build cross-platform mobile applications efficiently using React Native and Expo, with practical examples and deployment strategies.',
    date: '2024-03-10',
    readTime: '10 min read',
    imageUrl: '/blog/react-native-expo.png',
    tags: ['React Native', 'Expo', 'Mobile Development', 'JavaScript'],
    slug: 'react-native-expo'
  },
  {
    id: '3',
    title: 'Full-Stack Development with Node.js and MongoDB',
    description: 'A deep dive into building scalable backend systems using Node.js, Express, and MongoDB, with real-world examples and best practices.',
    date: '2024-03-05',
    readTime: '12 min read',
    imageUrl: '/blog/backend-development.jpg',
    tags: ['Node.js', 'MongoDB', 'Backend', 'Database'],
    slug: 'backend-development'
  },
  {
    id: '4',
    title: 'Advanced TypeScript Patterns in React',
    description: 'Explore advanced TypeScript patterns and best practices for building type-safe React applications with real-world examples.',
    date: '2024-02-28',
    readTime: '9 min read',
    imageUrl: '/blog/typescript-react.jpeg',
    tags: ['TypeScript', 'React', 'Development', 'Best Practices'],
    slug: 'typescript-react'
  }
]; 