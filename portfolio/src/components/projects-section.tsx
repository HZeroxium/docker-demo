import { ProjectCard } from "./project-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Project } from "@/lib/types"

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Dự án nổi bật</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/projects">Xem tất cả dự án</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
