import { 
  TextFields, 
  ListChecks, 
  Calendar, 
  Upload, 
  Mail,
  Phone,
  Link,
  CheckSquare,
  FileText,
  AlignLeft,
  Hash,
  Star,
  MapPin,
  CreditCard,
  Clock,
  Calculator,
  Percent
} from "lucide-react"

export type ElementType = 
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "url"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "richtext"
  | "number"
  | "rating"
  | "address"
  | "payment"
  | "time"
  | "calculation"
  | "percentage"

export const FormElements = {
  text: {
    type: "text",
    construct: (id: string) => ({
      id,
      type: "text",
      label: "Text Field",
      placeholder: "Enter text...",
      required: false,
    }),
    icon: TextFields,
    label: "Text Field",
  },
  textarea: {
    type: "textarea",
    construct: (id: string) => ({
      id,
      type: "textarea",
      label: "Text Area",
      placeholder: "Enter long text...",
      required: false,
      rows: 3,
    }),
    icon: AlignLeft,
    label: "Text Area",
  },
  email: {
    type: "email",
    construct: (id: string) => ({
      id,
      type: "email",
      label: "Email",
      placeholder: "Enter email address...",
      required: false,
      validation: {
        pattern: "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
        customError: "Please enter a valid email address",
      },
    }),
    icon: Mail,
    label: "Email Field",
  },
  phone: {
    type: "phone",
    construct: (id: string) => ({
      id,
      type: "phone",
      label: "Phone",
      placeholder: "Enter phone number...",
      required: false,
      validation: {
        pattern: "^\\+?[1-9]\\d{1,14}$",
        customError: "Please enter a valid phone number",
      },
    }),
    icon: Phone,
    label: "Phone Field",
  },
  url: {
    type: "url",
    construct: (id: string) => ({
      id,
      type: "url",
      label: "URL",
      placeholder: "Enter website URL...",
      required: false,
      validation: {
        pattern: "^https?://[^\\s/$.?#].[^\\s]*$",
        customError: "Please enter a valid URL",
      },
    }),
    icon: Link,
    label: "URL Field",
  },
  select: {
    type: "select",
    construct: (id: string) => ({
      id,
      type: "select",
      label: "Select",
      options: ["Option 1", "Option 2", "Option 3"],
      required: false,
    }),
    icon: ListChecks,
    label: "Select",
  },
  checkbox: {
    type: "checkbox",
    construct: (id: string) => ({
      id,
      type: "checkbox",
      label: "Checkbox",
      options: ["Option 1", "Option 2", "Option 3"],
      required: false,
    }),
    icon: CheckSquare,
    label: "Checkbox Group",
  },
  date: {
    type: "date",
    construct: (id: string) => ({
      id,
      type: "date",
      label: "Date",
      required: false,
    }),
    icon: Calendar,
    label: "Date Picker",
  },
  file: {
    type: "file",
    construct: (id: string) => ({
      id,
      type: "file",
      label: "File Upload",
      required: false,
      accept: "*/*",
    }),
    icon: Upload,
    label: "File Upload",
  },
  richtext: {
    type: "richtext",
    construct: (id: string) => ({
      id,
      type: "richtext",
      label: "Rich Text",
      placeholder: "Enter formatted text...",
      required: false,
    }),
    icon: FileText,
    label: "Rich Text Editor",
  },
  number: {
    type: "number",
    construct: (id: string) => ({
      id,
      type: "number",
      label: "Number",
      placeholder: "Enter number...",
      required: false,
      validation: {
        min: 0,
        max: 100,
        customError: "Please enter a valid number",
      },
    }),
    icon: Hash,
    label: "Number Input",
  },
  rating: {
    type: "rating",
    construct: (id: string) => ({
      id,
      type: "rating",
      label: "Rating",
      required: false,
      maxRating: 5,
      allowHalf: false,
    }),
    icon: Star,
    label: "Rating Input",
  },
  address: {
    type: "address",
    construct: (id: string) => ({
      id,
      type: "address",
      label: "Address",
      required: false,
      fields: {
        street: { label: "Street Address", required: true },
        city: { label: "City", required: true },
        state: { label: "State/Province", required: true },
        zip: { label: "ZIP/Postal Code", required: true },
        country: { label: "Country", required: true },
      },
    }),
    icon: MapPin,
    label: "Address Fields",
  },
  payment: {
    type: "payment",
    construct: (id: string) => ({
      id,
      type: "payment",
      label: "Payment Information",
      required: false,
      fields: {
        cardNumber: { label: "Card Number", required: true },
        expiry: { label: "Expiry Date", required: true },
        cvv: { label: "CVV", required: true },
      },
    }),
    icon: CreditCard,
    label: "Payment Fields",
  },
  time: {
    type: "time",
    construct: (id: string) => ({
      id,
      type: "time",
      label: "Time",
      required: false,
      format: "24h",
      validation: {
        min: "00:00",
        max: "23:59",
      },
    }),
    icon: Clock,
    label: "Time Picker",
  },
  calculation: {
    type: "calculation",
    construct: (id: string) => ({
      id,
      type: "calculation",
      label: "Calculation",
      formula: "",
      format: "number",
      decimals: 2,
      fields: [],
    }),
    icon: Calculator,
    label: "Calculation Field",
  },
  percentage: {
    type: "percentage",
    construct: (id: string) => ({
      id,
      type: "percentage",
      label: "Percentage",
      required: false,
      validation: {
        min: 0,
        max: 100,
        customError: "Please enter a valid percentage (0-100)",
      },
    }),
    icon: Percent,
    label: "Percentage Input",
  },
}