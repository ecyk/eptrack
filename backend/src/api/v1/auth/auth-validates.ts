import z from "zod";

export const loginSchema = z.object({
  username: z.string().min(4).max(32),
  password: z.string().min(8).max(32),
});

export const registerSchema = z.object({
  username: z.string().min(4).max(32),
  password: z.string().min(8).max(32),
});

export const passwordResetSchema = z.object({
  username: z.string().min(4).max(32),
  password: z.string().min(8).max(32),
  newPassword: z.string().min(8).max(32),
});
