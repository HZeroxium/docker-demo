import { Box, Container, Typography, Button, Avatar, Stack, IconButton } from "@mui/material"
import { GitHub, LinkedIn, Email, Download } from "@mui/icons-material"
import Link from "next/link"

export function Hero() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        pt: 8,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center">
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mb: 4,
              bgcolor: "primary.main",
              fontSize: "3rem",
              fontWeight: 700,
            }}
          >
            TN
          </Avatar>

          <Typography variant="h1" gutterBottom>
            Xin chào, tôi là{" "}
            <Box component="span" sx={{ color: "secondary.light" }}>
              Tên của bạn
            </Box>
          </Typography>

          <Typography variant="h5" sx={{ mb: 4, maxWidth: 600, mx: "auto", opacity: 0.9 }}>
            Full Stack Developer với niềm đam mê tạo ra những ứng dụng web hiện đại và trải nghiệm người dùng tuyệt vời
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/projects"
              sx={{ bgcolor: "white", color: "primary.main", "&:hover": { bgcolor: "grey.100" } }}
            >
              Xem dự án
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Download />}
              sx={{ borderColor: "white", color: "white", "&:hover": { borderColor: "grey.300" } }}
            >
              Tải CV
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              component={Link}
              href="https://github.com"
              target="_blank"
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <GitHub />
            </IconButton>
            <IconButton
              component={Link}
              href="https://linkedin.com"
              target="_blank"
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <LinkedIn />
            </IconButton>
            <IconButton
              component={Link}
              href="mailto:your.email@example.com"
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <Email />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
