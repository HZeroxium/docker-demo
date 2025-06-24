import { Card, CardContent } from "@/components/ui/card"
import { Code, Palette, Zap } from "lucide-react"

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
      icon: Zap,
      title: "Performance",
      description: "Tối ưu hiệu suất và tốc độ tải trang",
    },
  ]

  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Giới thiệu về tôi</h2>

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
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
