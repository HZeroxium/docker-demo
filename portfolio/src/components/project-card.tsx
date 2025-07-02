import { Card, CardContent, CardMedia, Button, Badge, CardHeader, CardHeaderProps } from "@mui/material"
import { ExternalLink, Github } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={project.image_url || "/placeholder.svg?height=200&width=300"}
          alt={project.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardHeader>{project.title}</CardHeader>
        <CardContent>{project.description}</CardContent>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="standard">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {project.live_url && (
            <Button size="small" component={Link} href={project.live_url} target="_blank" startIcon={<ExternalLink className="mr-2 h-4 w-4" />}>
              Live Demo
            </Button>
          )}
          {project.github_url && (
            <Button variant="outlined" size="small" component={Link} href={project.github_url} target="_blank" startIcon={<Github className="mr-2 h-4 w-4" />}>
              Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
