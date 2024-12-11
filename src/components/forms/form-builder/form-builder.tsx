import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"

import { FormElements, ElementType } from "./form-elements"
import { ElementsSidebar } from "./elements-sidebar"
import { FormElementWrapper } from "./form-element-wrapper"
import { formSchema } from "@/lib/validations/form"
import { useToast } from "@/components/ui/use-toast"
import { useFormBuilder } from "./form-builder-context"
import { FormHeader } from "./form-header"
import { FormPreview } from "./form-preview"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

interface FormField {
  id: string
  type: ElementType
  [key: string]: any
}

export function FormBuilder() {
  const { fields, setFields, isPreview, setFormData } = useFormBuilder()
  const { toast } = useToast()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "GUEST_RECEPTION",
      fields: [],
      published: false,
    },
  })
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const addField = (type: ElementType) => {
    const element = FormElements[type]
    const newField = element.construct(`field-${Date.now()}`)
    
    // Validate field structure
    try {
      formFieldSchema.parse(newField)
    } catch (error) {
      toast({
        title: "Invalid field configuration",
        description: "The field could not be added due to validation errors.",
        variant: "destructive",
      })
      return
    }
    
    const updatedFields = [...fields, newField]
    setFields(updatedFields)
    setFormData({ fields: updatedFields })
  }

  const removeField = (id: string) => {
    const updatedFields = fields.filter((field) => field.id !== id)
    setFields(updatedFields)
    setFormData({ fields: updatedFields })
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    )
    setFields(updatedFields)
    setFormData({ fields: updatedFields })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      const updateFields = (items: FormField[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      }
      const updatedFields = updateFields(fields)
      setFields(updatedFields)
      setFormData({ fields: updatedFields })
    }
  }

  if (isPreview) {
    return <FormPreview />
  }

  return (
    <div className="flex h-full gap-4">
      <ElementsSidebar onAddElement={addField} />
      <div className="flex-1 space-y-4">
        <FormHeader />
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-4 p-4 border rounded-lg min-h-[500px]">
            {fields.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Drag and drop elements here
              </div>
            ) : (
              <SortableContext items={fields.map((f) => f.id)}>
                {fields.map((field) => (
                  <FormElementWrapper
                    key={field.id}
                    field={field}
                    onRemove={() => removeField(field.id)}
                    onUpdate={(updates) => updateField(field.id, updates)}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  )
}