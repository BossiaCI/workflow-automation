import { z } from "zod"

export const emailValidation = z.string().email("Invalid email address")

export const phoneValidation = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")

export const urlValidation = z
  .string()
  .url("Invalid URL format")

export const dateValidation = z.coerce
  .date()
  .min(new Date("1900-01-01"), "Date too far in the past")
  .max(new Date("2100-01-01"), "Date too far in the future")

export const timeValidation = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")

export const percentageValidation = z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage must not exceed 100")

export function getFieldValidation(type: string, validation?: any) {
  let schema = z.string()

  // Apply common validations if configured
  if (validation?.required) {
    schema = schema.min(1, validation.customError || "This field is required")
  }
  if (validation?.min) {
    schema = schema.min(validation.min, `Minimum ${validation.min} characters required`)
  }
  if (validation?.max) {
    schema = schema.max(validation.max, `Maximum ${validation.max} characters allowed`)
  }
  if (validation?.pattern) {
    schema = schema.regex(new RegExp(validation.pattern), validation.customError || "Invalid format")
  }

  // Apply field-specific validations
  switch (type) {
    case "email":
      schema = emailValidation
      break
    case "phone":
      schema = phoneValidation
      break
    case "url":
      schema = urlValidation
      break
    case "date":
      schema = dateValidation
      break
    case "time":
      schema = timeValidation
      break
    case "percentage":
      schema = percentageValidation
      break
    case "number":
      schema = z.coerce
        .number()
        .min(validation?.min || -Infinity)
        .max(validation?.max || Infinity)
      break
  }

  return schema
}

export function validateField(value: any, type: string, validation?: any) {
  try {
    const schema = getFieldValidation(type, validation)
    schema.parse(value)
    return { valid: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: "Invalid value" }
  }
}