import { Box, Container, Typography, Card, CardContent, CardMedia, Button, Chip, Stack } from "@mui/material"
import { Launch, GitHub } from "@mui/icons-material"
import Link from "next/link"
import type { Project } from "@/lib/types"

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" textAlign="center" gutterBottom>
          Dự án nổi bật
        </Typography>

        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {projects.map((project) => (
            <Box key={project.id} className="h-full flex flex-col">
              <Card className="flex flex-col h-full">
                <CardMedia
                  component="img"
                  height="200"
                  image={project.image_url || "/placeholder.svg?height=200&width=300"}
                  alt={project.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    {project.technologies.map((tech) => (
                      <Chip key={tech} label={tech} size="small" variant="outlined" />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    {project.live_url && (
                      <Button
                        size="small"
                        startIcon={<Launch />}
                        component={Link}
                        href={project.live_url}
                        target="_blank"
                      >
                        Demo
                      </Button>
                    )}
                    {project.github_url && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GitHub />}
                        component={Link}
                        href={project.github_url}
                        target="_blank"
                      >
                        Code
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Box textAlign="center">
          <Button variant="contained" size="large" component={Link} href="/projects">
            Xem tất cả dự án
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
