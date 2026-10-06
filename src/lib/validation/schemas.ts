import { z } from "zod";

export const emailSchema = z.string().trim().email("invalid_email");
export const passwordSchema = z.string().min(8, "password_min_8");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "required"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  email: emailSchema,
  password: passwordSchema,
  businessName: z.string().trim().min(1, "required").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,40}$/, "slug_invalid")
    .optional()
    .or(z.literal("")),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "required").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  sku: z.string().trim().max(60).optional().nullable().or(z.literal("")),
  price: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]).default("AVAILABLE"),
  variants: z
    .array(
      z.object({
        size: z.string().trim().max(40).optional().nullable(),
        color: z.string().trim().max(40).optional().nullable(),
        sku: z.string().trim().max(60).optional().nullable(),
        price: z.coerce.number().int().nonnegative().optional().nullable(),
        status: z.enum(["AVAILABLE", "UNAVAILABLE"]).default("AVAILABLE"),
      })
    )
    .optional()
    .default([]),
});

export const productUpdateSchema = productCreateSchema.partial();

export const bulkAvailabilitySchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(500),
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]),
});

export const bulkPriceSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(500),
  price: z.coerce.number().int().nonnegative(),
});

export const productImportLineSchema = z.object({
  raw: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]),
});

export const rulesetSchema = z.object({
  address: z.string().trim().max(500).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  workingHours: z.record(z.string(), z.object({ open: z.string(), close: z.string() })).optional().nullable(),
  shippingInfo: z.string().trim().max(2000).optional().nullable(),
  paymentMethods: z.string().trim().max(1000).optional().nullable(),
  returnPolicy: z.string().trim().max(2000).optional().nullable(),
  citiesServed: z.string().trim().max(1000).optional().nullable(),
  generalInfo: z.string().trim().max(3000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const sendMessageSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export const handoffSchema = z.object({
  state: z.enum(["AUTO", "HUMAN"]),
});
