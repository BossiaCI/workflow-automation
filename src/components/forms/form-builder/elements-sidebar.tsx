import { FormElements, ElementType } from "./form-elements"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ElementsSidebarProps {
  onAddElement: (type: ElementType) => void
}

export function ElementsSidebar({ onAddElement }: ElementsSidebarProps) {
  return (
    <div className="w-60 border-r p-4 space-y-4">
      <h3 className="font-semibold">Form Elements</h3>
      <div className="space-y-2">
        {Object.entries(FormElements).map(([type, element]) => {
          const Icon = element.icon
          return (
            <Button
              key={type}
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 h-auto py-2",
              )}
              onClick={() => onAddElement(type as ElementType)}
            >
              <Icon className="h-4 w-4" />
              {element.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}