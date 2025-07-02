import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from "@mui/material"
import { Code, Palette, Speed } from "@mui/icons-material"

export function About() {
  const features = [
    {
      icon: Code,
      title: "Clean Code",
      description: "Viết code sạch, dễ đọc và dễ bảo trì",
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Thiết kế giao diện đẹp và trải nghiệm người dùng tốt",
    },
    {
      icon: Speed,
      title: "Performance",
      description: "Tối ưu hiệu suất và tốc độ tải trang",
    },
  ]

  return (
    <Box sx={{ py: 10, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Typography variant="h2" textAlign="center" gutterBottom>
          Giới thiệu về tôi
        </Typography>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                Tôi là một Full Stack Developer với hơn 3 năm kinh nghiệm trong việc phát triển các ứng dụng web hiện
                đại. Tôi có niềm đam mê với công nghệ và luôn tìm kiếm những cách thức mới để giải quyết vấn đề.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Chuyên môn của tôi bao gồm React, Next.js, Node.js, và các công nghệ web hiện đại khác. Tôi thích làm
                việc trong môi trường năng động và luôn sẵn sàng học hỏi những điều mới.
              </p>
            </div>
            <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
          </div>

        <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      </Container>
    </Box>
  )
}
