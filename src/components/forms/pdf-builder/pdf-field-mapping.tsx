import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface FieldMapping {
  id: string
  fieldId: string
  x: number
  y: number
  width: number
  fontSize: number
  fontFamily: string
  alignment: "left" | "center" | "right"
}

interface PdfFieldMappingProps {
  formFields: any[]
  mappings: FieldMapping[]
  onUpdate: (mappings: FieldMapping[]) => void
}

export function PdfFieldMapping({
  formFields,
  mappings,
  onUpdate,
}: PdfFieldMappingProps) {
  const [selectedField, setSelectedField] = useState<string>("")

  const handleAddMapping = () => {
    if (!selectedField) return

    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      fieldId: selectedField,
      x: 0,
      y: 0,
      width: 200,
      fontSize: 12,
      fontFamily: "Helvetica",
      alignment: "left",
    }

    onUpdate([...mappings, newMapping])
    setSelectedField("")
  }

  const handleRemoveMapping = (id: string) => {
    onUpdate(mappings.filter((m) => m.id !== id))
  }

  const handleUpdateMapping = (id: string, updates: Partial<FieldMapping>) => {
    onUpdate(
      mappings.map((m) => (m.id === id ? { ...m, ...updates } : m))
    )
  }

  const getFieldLabel = (fieldId: string) => {
    const field = formFields.find((f) => f.id === fieldId)
    return field?.label || fieldId
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Mappings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {formFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddMapping}
            disabled={!selectedField}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {mappings.map((mapping) => (
            <div
              key={mapping.id}
              className="flex flex-col space-y-2 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{getFieldLabel(mapping.fieldId)}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMapping(mapping.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>X Position</Label>
                  <Input
                    type="number"
                    value={mapping.x}
                    onChange={(e) =>
                      handleUpdateMapping(mapping.id, {
                        x: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y Position</Label>
                  <Input
                    type="number"
                    value={mapping.y}
                    onChange={(e) =>
                      handleUpdateMapping(mapping.id, {
                        y: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={mapping.width}
                    onChange={(e) =>
                      handleUpdateMapping(mapping.id, {
                        width: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={mapping.fontSize}
                    onChange={(e) =>
                      handleUpdateMapping(mapping.id, {
                        fontSize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={mapping.fontFamily}
                    onValueChange={(value) =>
                      handleUpdateMapping(mapping.id, { fontFamily: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times-Roman">Times Roman</SelectItem>
                      <SelectItem value="Courier">Courier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <Select
                    value={mapping.alignment}
                    onValueChange={(value: "left" | "center" | "right") =>
                      handleUpdateMapping(mapping.id, { alignment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )