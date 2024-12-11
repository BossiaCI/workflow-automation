import { createContext, useContext, useState } from "react"
import { ElementType } from "./form-elements"

interface FormField {
  id: string
  type: ElementType
  [key: string]: any
}

interface FormData {
  id?: string
  title: string
  description: string
  type: string
  fields: FormField[]
  published: boolean
}

interface FormBuilderContextType {
  formData: FormData
  setFormData: (data: Partial<FormData>) => void
  fields: FormField[]
  setFields: (fields: FormField[]) => void
  isPreview: boolean
  setIsPreview: (preview: boolean) => void
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined)

export function FormBuilderProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    type: "GUEST_RECEPTION",
    fields: [],
    published: false,
  })
  const [fields, setFields] = useState<FormField[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <FormBuilderContext.Provider
      value={{
        formData,
        setFormData: updateFormData,
        fields,
        setFields,
        isPreview,
        setIsPreview,
        isSaving,
        setIsSaving,
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  )
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext)
  if (!context) {
    throw new Error("useFormBuilder must be used within FormBuilderProvider")
  }
  return context
}