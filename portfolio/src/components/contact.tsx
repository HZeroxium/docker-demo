// src/components/contact.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { submitContactForm } from "@/app/actions"  // ✅ Import từ app/actions
import { useActionState } from "react"

export function Contact() {
  const [state, action, isPending] = useActionState(submitContactForm, null)

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Liên hệ với tôi</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Hãy kết nối với tôi</h3>
              <p className="text-muted-foreground mb-8">
                Tôi luôn sẵn sàng thảo luận về các dự án mới, cơ hội hợp tác hoặc đơn giản chỉ là trò chuyện về công nghệ.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>your.email@example.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+84 123 456 789</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Hồ Chí Minh, Việt Nam</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gửi tin nhắn</CardTitle>
                <CardDescription>Điền thông tin bên dưới và tôi sẽ phản hồi sớm nhất có thể</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={action} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Họ tên</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="message">Tin nhắn</Label>
                    <Textarea id="message" name="message" rows={4} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    <Send className="mr-2 h-4 w-4" />
                    {isPending ? "Đang gửi..." : "Gửi tin nhắn"}
                  </Button>
                </form>

                {state && (
                  <div className={`mt-4 text-center ${state.success ? "text-green-600" : "text-red-600"}`}>
                    {state.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}