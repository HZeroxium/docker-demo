"use client"

import { Box, Container, Typography, Grid, Card, CardContent, TextField, Button, Stack, Alert } from "@mui/material"
import { Email, Phone, LocationOn, Send } from "@mui/icons-material"
import { submitContactForm } from "@/app/actions"
import { useActionState } from "react"

export function Contact() {
  const submitContact = (_state: { success: boolean; message: string; } | null, formData: FormData) => submitContactForm(formData);
  const [state, action, isPending] = useActionState(submitContact, null)

  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" textAlign="center" gutterBottom>
          Liên hệ với tôi
        </Typography>

        <Grid container spacing={6}>
            <div style={{ width: "100%", maxWidth: "50%", padding: "16px" }}>
            <Typography variant="h5" gutterBottom>
              Hãy kết nối với tôi
            </Typography>
            <Typography variant="body1" paragraph style={{ marginBottom: "16px" }}>
              Tôi luôn sẵn sàng thảo luận về các dự án mới, cơ hội hợp tác hoặc đơn giản chỉ là trò chuyện về công nghệ.
            </Typography>
        
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
              <Email color="primary" />
              <Typography>your.email@example.com</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
              <Phone color="primary" />
              <Typography>+84 123 456 789</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
              <LocationOn color="primary" />
              <Typography>Hồ Chí Minh, Việt Nam</Typography>
              </Stack>
            </Stack>
            </div>

          <div style={{ width: "100%", maxWidth: "50%", padding: "16px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gửi tin nhắn
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Điền thông tin bên dưới và tôi sẽ phản hồi sớm nhất có thể
                </Typography>

                <Box component="form" action={action}>
                  <Stack spacing={3}>
                    <TextField name="name" label="Họ tên" fullWidth required variant="outlined" />
                    <TextField name="email" label="Email" type="email" fullWidth required variant="outlined" />
                    <TextField
                      name="message"
                      label="Tin nhắn"
                      multiline
                      rows={4}
                      fullWidth
                      required
                      variant="outlined"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      disabled={isPending}
                      fullWidth
                    >
                      {isPending ? "Đang gửi..." : "Gửi tin nhắn"}
                    </Button>
                  </Stack>
                </Box>

                {state && (
                  <Alert severity={state.success ? "success" : "error"} sx={{ mt: 2 }}>
                    {state.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Container>
    </Box>
  )
}
