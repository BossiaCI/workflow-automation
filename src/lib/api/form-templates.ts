import { FormType } from "@prisma/client"

export const formTemplates = {
  [FormType.GUEST_RECEPTION]: {
    title: "Guest Reception Form",
    description: "Standard guest reception form template",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        required: true,
        placeholder: "Enter your full name",
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        required: true,
        placeholder: "Enter your email",
        validation: {
          pattern: "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
          customError: "Please enter a valid email address",
        },
      },
      {
        id: "phone",
        type: "phone",
        label: "Phone Number",
        required: true,
        placeholder: "Enter your phone number",
      },
      {
        id: "visitPurpose",
        type: "select",
        label: "Purpose of Visit",
        required: true,
        options: [
          "Business Meeting",
          "Interview",
          "Delivery",
          "Personal Visit",
          "Other",
        ],
      },
      {
        id: "hostName",
        type: "text",
        label: "Host Name",
        required: true,
        placeholder: "Who are you here to see?",
      },
    ],
  },
  [FormType.BILLING]: {
    title: "Billing Information Form",
    description: "Standard billing information collection form",
    fields: [
      {
        id: "billingName",
        type: "text",
        label: "Billing Name",
        required: true,
        placeholder: "Enter billing name",
      },
      {
        id: "billingAddress",
        type: "address",
        label: "Billing Address",
        required: true,
      },
      {
        id: "paymentMethod",
        type: "select",
        label: "Payment Method",
        required: true,
        options: ["Credit Card", "Bank Transfer", "PayPal"],
      },
      {
        id: "amount",
        type: "number",
        label: "Amount",
        required: true,
        validation: {
          min: 0,
          customError: "Amount must be greater than 0",
        },
      },
      {
        id: "currency",
        type: "select",
        label: "Currency",
        required: true,
        options: ["USD", "EUR", "GBP"],
      },
    ],
  },
  [FormType.EVENT]: {
    title: "Event Registration Form",
    description: "Standard event registration form template",
    fields: [
      {
        id: "attendeeName",
        type: "text",
        label: "Attendee Name",
        required: true,
        placeholder: "Enter your full name",
      },
      {
        id: "attendeeEmail",
        type: "email",
        label: "Email Address",
        required: true,
        placeholder: "Enter your email",
      },
      {
        id: "ticketType",
        type: "select",
        label: "Ticket Type",
        required: true,
        options: ["Standard", "VIP", "Group"],
      },
      {
        id: "quantity",
        type: "number",
        label: "Number of Tickets",
        required: true,
        validation: {
          min: 1,
          max: 10,
          customError: "Please select between 1 and 10 tickets",
        },
      },
      {
        id: "dietaryRequirements",
        type: "checkbox",
        label: "Dietary Requirements",
        options: [
          "Vegetarian",
          "Vegan",
          "Gluten-free",
          "Dairy-free",
          "None",
        ],
      },
    ],
  },
}