import { Metadata } from "next"
import { FormBuilder } from "@/components/forms/form-builder/form-builder"
import { FormBuilderProvider } from "@/components/forms/form-builder/form-builder-context"

export const metadata: Metadata = {
  title: "Form Builder",
  description: "Create and customize forms with drag-and-drop interface",
}

export default function FormBuilderPage() {
  return (
    <FormBuilderProvider>
      <div className="space-y-6">
        <FormBuilder />
      </div>
    </FormBuilderProvider>
  )
}