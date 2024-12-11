import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormElements } from "./form-elements"
import { ElementSettings } from "./element-settings"

interface FormElementWrapperProps {
  field: any
  onRemove: () => void
  onUpdate: (updates: any) => void
}

export function FormElementWrapper({
  field,
  onRemove,
  onUpdate,
}: FormElementWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      <CardHeader className="flex flex-row items-center gap-2 py-2">
        <Button
          variant="ghost"
          className="cursor-grab p-1 h-auto"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <span className="font-medium">{field.label}</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ElementSettings field={field} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  )
}