import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HexColorPicker } from "react-colorful"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PdfElementSettings({ element, onUpdate }) {
  if (!element) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Element Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select an element to edit its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Element Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="position">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="position" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={element.position.x}
                  onChange={(e) =>
                    onUpdate({
                      position: { ...element.position, x: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={element.position.y}
                  onChange={(e) =>
                    onUpdate({
                      position: { ...element.position, y: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="number"
                  value={element.style?.width || "auto"}
                  onChange={(e) =>
                    onUpdate({
                      style: { ...element.style, width: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="number"
                  value={element.style?.height || "auto"}
                  onChange={(e) =>
                    onUpdate({
                      style: { ...element.style, height: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={element.style?.fontSize || 12}
                    onChange={(e) =>
                      onUpdate({
                        style: { ...element.style, fontSize: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={element.style?.fontWeight || "normal"}
                    onValueChange={(value) =>
                      onUpdate({
                        style: { ...element.style, fontWeight: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Text Color</Label>
                <HexColorPicker
                  color={element.style?.color || "#000000"}
                  onChange={(color) =>
                    onUpdate({
                      style: { ...element.style, color },
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Text Align</Label>
                <Select
                  value={element.style?.textAlign || "left"}
                  onValueChange={(value) =>
                    onUpdate({
                      style: { ...element.style, textAlign: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            {element.type === "text" && (
              <div className="space-y-2">
                <Label>Text Content</Label>
                <Input
                  value={element.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                />
              </div>
            )}
            {element.type === "image" && (
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={element.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
            )}
            {element.type === "field" && (
              <div className="space-y-2">
                <Label>Field Format</Label>
                <Input
                  value={element.format || ""}
                  onChange={(e) => onUpdate({ format: e.target.value })}
                  placeholder="e.g., ${value}"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}