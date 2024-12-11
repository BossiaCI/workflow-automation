import { z } from "zod"
import { FormType } from "@prisma/client"

const validationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customError: z.string().optional(),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  matchField: z.string().optional(),
})

const fieldSettingsSchema = z.object({
  placeholder: z.string().optional(),
  rows: z.number().optional(),
  maxLength: z.number().optional(),
  accept: z.string().optional(),
  multiple: z.boolean().optional(),
  format: z.string().optional(),
  step: z.number().optional(),
  currency: z.string().optional(),
  maxFileSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional(),
})

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().min(1, "Label is required"),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: validationSchema.optional(),
  settings: fieldSettingsSchema.optional(),
  conditional: z.object({
    field: z.string().optional(),
    operator: z.string().optional(),
    value: z.any().optional(),
  }).optional(),
})

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum([FormType.GUEST_RECEPTION, FormType.BILLING, FormType.EVENT]),
  fields: z.array(formFieldSchema),
  published: z.boolean().default(false),
})

export type FormData = z.infer<typeof formSchema>
export type FormField = z.infer<typeof formFieldSchema>