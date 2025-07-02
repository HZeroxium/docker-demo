import Link from "next/link"
import { Box, Container, IconButton, Typography, Stack } from "@mui/material"
import { GitHub as GithubIcon, LinkedIn, MailOutline } from "@mui/icons-material"

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "background.paper", py: 6 }}>
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton component="a" href="https://github.com" target="_blank">
            <GithubIcon />
          </IconButton>
          <IconButton component="a" href="https://linkedin.com" target="_blank">
            <LinkedIn />
          </IconButton>
          <IconButton component="a" href="mailto:your.email@example.com">
            <MailOutline />
          </IconButton>
        </Stack>
        <Typography variant="body2" align="center" color="text.secondary">
          © 2024 Tên của bạn. Tất cả quyền được bảo lưu.
        </Typography>
      </Container>
    </Box>
  )
}
