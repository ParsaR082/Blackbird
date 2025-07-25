import { z } from "zod";

export const GameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  link: z.string().url("Must be a valid URL"),
  category: z.string().min(3),
  color: z.string().min(3),
  isMultiplayer: z.boolean().optional(),
}); 