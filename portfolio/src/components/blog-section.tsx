import { BlogCard } from "./blog-card"
import { Button } from "@mui/material"
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
            <Button size="large" variant="contained" color="primary" component={Link} href="/blog">
              Xem tất cả bài viết
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
