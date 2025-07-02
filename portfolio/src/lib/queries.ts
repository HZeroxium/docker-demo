import pool from "./db"
import type { Project, BlogPost } from "./types"

// Mock data fallback
const mockProjects: Project[] = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "Nền tảng thương mại điện tử hoàn chỉnh với React, Node.js và PostgreSQL",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-tvx2BFjpYmfiIBLV25XIfVZy4KhCYFLB7w&s",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
    live_url: "https://example.com",
    github_url: "https://github.com",
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Task Management App",
    description: "Ứng dụng quản lý công việc với tính năng real-time và collaboration",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-tvx2BFjpYmfiIBLV25XIfVZy4KhCYFLB7w&s",
    technologies: ["Next.js", "TypeScript", "Prisma", "Socket.io"],
    live_url: "https://example.com",
    github_url: "https://github.com",
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Bắt đầu với Next.js 15",
    slug: "bat-dau-voi-nextjs-15",
    excerpt: "Hướng dẫn chi tiết về các tính năng mới trong Next.js 15",
    content: "Next.js 15 đã ra mắt với nhiều tính năng mới thú vị...",
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const projects = await pool.query("SELECT * FROM projects WHERE featured = true ORDER BY created_at DESC")
    return projects.rows as Project[]
  } catch (error) {
    console.warn("Database not ready, using mock data:", error)
    return mockProjects.filter((p) => p.featured)
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const projects = await pool.query("SELECT * FROM projects ORDER BY created_at DESC")
    return projects.rows as Project[]
  } catch (error) {
    console.warn("Database not ready, using mock data:", error)
    return mockProjects
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await pool.query("SELECT * FROM blog_posts WHERE published = true ORDER BY created_at DESC")
    return posts.rows as BlogPost[]
  } catch (error) {
    console.warn("Database not ready, using mock data:", error)
    return mockBlogPosts
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await pool.query("SELECT * FROM blog_posts WHERE slug = $1 AND published = true", [slug])
    return (posts.rows[0] as BlogPost) || null
  } catch (error) {
    console.warn("Database not ready, using mock data:", error)
    return mockBlogPosts.find((post) => post.slug === slug) || null
  }
}

export async function createContactMessage(name: string, email: string, message: string) {
  try {
    await pool.query("INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)", [name, email, message])
  } catch (error) {
    console.warn("Database not ready, contact message not saved:", error)
    // Could implement local storage or other fallback here
  }
}