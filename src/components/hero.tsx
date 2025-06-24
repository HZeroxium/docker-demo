// components/hero.tsx
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, Download } from 'lucide-react'
import Link from "next/link"

export function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              TN
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hello, my name is {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Your Name
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Full Stack Developer với niềm đam mê tạo ra những ứng dụng web hiện đại và trải nghiệm người dùng tuyệt vời
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/projects">Xem dự án</Link>
            </Button>
            <Button variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Tải CV
            </Button>
          </div>

          <div className="flex justify-center space-x-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://github.com" target="_blank">
                <Github className="h-6 w-6" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://linkedin.com" target="_blank">
                <Linkedin className="h-6 w-6" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="mailto:your.email@example.com">
                <Mail className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}