import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Chip, Stack, Button } from "@mui/material"
import Link from "next/link"
import { Launch, GitHub } from "@mui/icons-material"

export function Projects() {
  const projects = [
    {
      title: "E-commerce Platform",
      description: "Nền tảng thương mại điện tử hoàn chỉnh với React, Node.js và MongoDB",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
    {
      title: "Task Management App",
      description: "Ứng dụng quản lý công việc với tính năng real-time và collaboration",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["Next.js", "TypeScript", "Prisma", "Socket.io"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
    {
      title: "Weather Dashboard",
      description: "Dashboard thời tiết với data visualization và forecast",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["Vue.js", "Chart.js", "OpenWeather API"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
    },
  ]

  return (
    <Box component="section" id="projects" sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" gutterBottom>
          Dự án của tôi
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {projects.map((project) => (
            <div key={project.title} style={{ flex: "1 1 calc(33.33% - 16px)" }}>
              <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <CardMedia
            component="img"
            height="200"
            image={project.image}
            alt={project.title}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{project.title}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {project.description}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {project.technologies.map((tech) => (
                <Chip key={tech} label={tech} size="small" />
              ))}
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              startIcon={<Launch />}
              component={Link}
              href={project.liveUrl}
              target="_blank"
            >
              Live Demo
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<GitHub />}
              component={Link}
              href={project.githubUrl}
              target="_blank"
            >
              Code
            </Button>
          </CardActions>
              </Card>
            </div>
          ))}
        </div>
      
      </Container>
    </Box>
  )
}
