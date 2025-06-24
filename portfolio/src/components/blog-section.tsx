import { BlogCard } from "./blog-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { BlogPost } from "@/lib/types"

interface BlogSectionProps {
  posts: BlogPost[]
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Blog mới nhất</h2>

          <div className="space-y-8 mb-12">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/blog">Xem tất cả bài viết</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
