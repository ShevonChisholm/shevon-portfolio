'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export interface BlogFrontmatter {
  title: string;
  date: string;
  readTime: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

interface BlogPost extends BlogFrontmatter {
  slug: string;
}

export async function getBlogPost(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);
  
  return {
    frontmatter: data as BlogFrontmatter,
    content,
  };
}

export async function getAllBlogPosts() {
  const files = fs.readdirSync(BLOG_DIR);
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const { data } = matter(source);
      return {
        ...(data as BlogFrontmatter),
        slug: file.replace('.mdx', ''),
      };
    })
    .sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
} 