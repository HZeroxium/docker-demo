// app/page.tsx
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { ProjectsSection } from "@/components/projects-section"
import { BlogSection } from "@/components/blog-section"
import { Skills } from "@/components/skills"
import { Contact } from "@/components/contact"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getFeaturedProjects, getPublishedBlogPosts } from "@/lib/queries"

export default async function Home() {
  const [featuredProjects, blogPosts] = await Promise.all([
    getFeaturedProjects(), 
    getPublishedBlogPosts()
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <ProjectsSection projects={featuredProjects} />
        <BlogSection posts={blogPosts.slice(0, 3)} />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}