import { getPublishedBlogPosts } from "@/lib/queries"
import { BlogCard } from "@/components/blog-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Blog</h1>
              <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                Chia sẻ kiến thức và kinh nghiệm về lập trình, công nghệ
              </p>

              <div className="space-y-8">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
