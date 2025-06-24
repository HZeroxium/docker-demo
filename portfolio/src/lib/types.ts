// lib/types.ts
export interface Project {
  id: number
  title: string
  description: string
  image_url: string | null
  technologies: string[]
  live_url: string | null
  github_url: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}