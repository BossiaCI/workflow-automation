import Frame from "react-frame-component"
import { useRef, useState } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ELEMENT_TYPES = {
  TEXT: "text",
  FIELD: "field",
  IMAGE: "image",
  TABLE: "table",
  SIGNATURE: "signature",
}

export function PdfLayoutEditor({
  layout,
  onLayoutUpdate,
  onElementSelect,
  formFields,
}) {
  const [draggedElement, setDraggedElement] = useState(null)
  const editorRef = useRef(null)

  const handleDrop = (item, position) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: item.type,
      position,
      content: item.content || "",
      style: item.style || {},
    }

    onLayoutUpdate({
      ...layout,
      elements: [...layout.elements, newElement],
    })
  }

  const handleElementClick = (element) => {
    onElementSelect(element)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Select
          value={layout.settings.pageSize}
          onValueChange={(value) =>
            onLayoutUpdate({
              ...layout,
              settings: { ...layout.settings, pageSize: value },
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="LETTER">Letter</SelectItem>
            <SelectItem value="LEGAL">Legal</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={layout.settings.orientation}
          onValueChange={(value) =>
            onLayoutUpdate({
              ...layout,
              settings: { ...layout.settings, orientation: value },
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Orientation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <div className="w-48 space-y-2">
          <div className="font-semibold mb-2">Elements</div>
          {Object.entries(ELEMENT_TYPES).map(([key, type]) => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={() => setDraggedElement({ type })}
            >
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </Button>
          ))}
          <div className="font-semibold mt-4 mb-2">Form Fields</div>
          {formFields.map((field) => (
            <Button
              key={field.id}
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={() =>
                setDraggedElement({
                  type: "field",
                  content: field.id,
                })
              }
            >
              {field.label}
            </Button>
          ))}
        </div>

        <div
          ref={editorRef}
          className="flex-1 min-h-[842px] bg-white shadow-lg relative"
          style={{
            width: layout.settings.orientation === "portrait" ? "595px" : "842px",
            height: layout.settings.orientation === "portrait" ? "842px" : "595px",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (!draggedElement) return

            const rect = editorRef.current.getBoundingClientRect()
            const position = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            }
            handleDrop(draggedElement, position)
            setDraggedElement(null)
          }}
        >
          {layout.elements.map((element) => (
            <div
              key={element.id}
              className="absolute cursor-move"
              style={{
                left: element.position.x,
                top: element.position.y,
                ...element.style,
              }}
              onClick={() => handleElementClick(element)}
            >
              {element.type === "field" ? (
                <div className="p-2 border border-dashed border-gray-400 rounded">
                  {formFields.find((f) => f.id === element.content)?.label}
                </div>
              ) : (
                <div className="p-2 border border-dashed border-gray-400 rounded">
                  {element.type}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}