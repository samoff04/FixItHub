import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(500).optional(),
  college: z.string().max(120).optional(),
  gradYear: z.number().int().min(2020).max(2035).optional(),
  timezone: z.string().max(60).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  goals: z.array(z.string()).max(10).optional(),
  roles: z.array(z.string()).max(10).optional(),
  skills: z
    .array(z.object({ name: z.string().min(1).max(40), level: z.string().min(1).max(20) }))
    .max(25)
    .optional(),
});

export const connectionRequestSchema = z.object({
  receiverId: z.string().min(1),
  message: z.string().max(300).optional(),
});

export const teamSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().min(5).max(1000),
  eventId: z.string().optional().nullable(),
  maxMembers: z.number().int().min(2).max(12).default(5),
  lookingForRoles: z.array(z.string()).max(10).default([]),
  isOpen: z.boolean().default(true),
});

export const eventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  type: z.string().min(2).max(40),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().max(120).optional(),
  isOnline: z.boolean().default(true),
  maxTeamSize: z.number().int().min(1).max(12).default(4),
  tags: z.array(z.string()).max(10).default([]),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  profileVisibility: z.enum(["public", "connections", "private"]).optional(),
  showAvailability: z.boolean().optional(),
});

export const reportSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.string().min(3).max(120),
  details: z.string().max(1000).optional(),
});