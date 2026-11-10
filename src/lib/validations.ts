import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  username: z.string().trim().toLowerCase().min(3, "Username minimal 3 karakter").regex(/^[a-z0-9_.]+$/, "Username hanya huruf, angka, _ dan ."),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Konfirmasi password tidak sama",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak sama",
  path: ["confirmPassword"],
});

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
  materialId: z.string().optional(),
  language: z.enum(["id", "en"]).default("id"),
});

export const submitQuizSchema = z.object({
  assessmentId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string(), selectedOptionId: z.string() })).max(100),
  startedAt: z.string().optional(),
});
