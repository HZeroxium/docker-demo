// src/app/actions.ts
"use server"

import { createContactMessage } from "@/lib/queries"  // ✅ @/ vẫn hoạt động
import { revalidatePath } from "next/cache"

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  if (!name || !email || !message) {
    return {
      success: false,
      message: "Vui lòng điền đầy đủ thông tin",
    }
  }

  try {
    await createContactMessage(name, email, message)
    revalidatePath("/")

    return {
      success: true,
      message: "Cảm ơn bạn đã liên hệ! Tôi sẽ phản hồi sớm nhất có thể.",
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return {
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    }
  }
}