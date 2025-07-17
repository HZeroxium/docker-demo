// lib/queries.ts
import type { Project, BlogPost } from "./types";
import {
  getFeaturedProjects as getStaticFeaturedProjects,
  getAllProjects as getStaticAllProjects,
  getPublishedBlogPosts as getStaticPublishedBlogPosts,
  getBlogPostBySlug as getStaticBlogPostBySlug,
  createContactMessage as createStaticContactMessage,
} from "./data";

export async function getFeaturedProjects(): Promise<Project[]> {
  return getStaticFeaturedProjects();
}

export async function getAllProjects(): Promise<Project[]> {
  return getStaticAllProjects();
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return getStaticPublishedBlogPosts();
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  return getStaticBlogPostBySlug(slug);
}

export async function createContactMessage(
  name: string,
  email: string,
  message: string
): Promise<void> {
  createStaticContactMessage(name, email, message);
}
