import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

interface ElementSettingsProps {
  field: any
  onUpdate: (updates: any) => void
}

export function ElementSettings({ field, onUpdate }: ElementSettingsProps) {
  return (
    <Tabs defaultValue="basic">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            id={`${field.id}-label`}
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>
      {["text", "textarea", "email", "phone", "url"].includes(field.type) && (
        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            id={`${field.id}-placeholder`}
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      )}
        <div className="flex items-center space-x-2">
          <Switch
            id="required"
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
          <Label htmlFor="required">Required</Label>
        </div>
      </TabsContent>
      
      <TabsContent value="validation" className="space-y-4">
        <div className="space-y-4">
          {["text", "textarea", "email", "phone", "url"].includes(field.type) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Length</Label>
                  <Input
                    type="number"
                    value={field.validation?.min || ""}
                    onChange={(e) => 
                      onUpdate({
                        validation: {
                          ...field.validation,
                          min: parseInt(e.target.value) || undefined
                        }
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    value={field.validation?.max || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: {
                          ...field.validation,
                          max: parseInt(e.target.value) || undefined
                        }
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pattern (Regex)</Label>
                <Input
                  value={field.validation?.pattern || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        pattern: e.target.value
                      }
                    })
                  }
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label>Custom Error Message</Label>
            <Input
              value={field.validation?.customError || ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    customError: e.target.value
                  }
                })
              }
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.settings?.unique || false}
              onCheckedChange={(checked) =>
                onUpdate({
                  settings: {
                    ...field.settings,
                    unique: checked
                  }
                })
              }
            />
            <Label>Require Unique Values</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Conditional Display</Label>
            <Select
              value={field.conditional?.field || ""}
              onValueChange={(value) =>
                onUpdate({
                  conditional: {
                    ...field.conditional,
                    field: value
                  }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {/* Add field options here */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>
    </Tabs>
      <Accordion type="single" collapsible>
        <AccordionItem value="validation">
          <AccordionTrigger>Field Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Field-specific settings */}
              {field.type === "textarea" && (
                <div className="space-y-2">
                  <Label>Number of Rows</Label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={field.rows || 3}
                    onChange={(e) => onUpdate({ rows: parseInt(e.target.value) })}
                  />
                </div>
              )}
              
              {field.type === "select" && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {field.options.map((option: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...field.options]
                            newOptions[index] = e.target.value
                            onUpdate({ options: newOptions })
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOptions = field.options.filter((_: any, i: number) => i !== index)
                            onUpdate({ options: newOptions })
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onUpdate({ options: [...field.options, `Option ${field.options.length + 1}`] })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}
              
              {field.type === "rating" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maximum Rating</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={field.maxRating || 5}
                      onChange={(e) => onUpdate({ maxRating: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.allowHalf}
                      onCheckedChange={(checked) => onUpdate({ allowHalf: checked })}
                    />
                    <Label>Allow Half Ratings</Label>
                  </div>
                </div>
              )}
              
              {field.type === "file" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Accepted File Types</Label>
                    <Select
                      value={field.accept}
                      onValueChange={(value) => onUpdate({ accept: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select file types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/*">Images Only</SelectItem>
                        <SelectItem value=".pdf">PDF Files</SelectItem>
                        <SelectItem value=".doc,.docx">Word Documents</SelectItem>
                        <SelectItem value="*/*">All Files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum File Size (MB)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={field.maxSize || 5}
                      onChange={(e) => onUpdate({ maxSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
              
              {field.type === "calculation" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Formula</Label>
                    <Input
                      value={field.formula || ""}
                      onChange={(e) => onUpdate({ formula: e.target.value })}
                      placeholder="e.g., {field1} + {field2}"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Decimal Places</Label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      value={field.decimals || 2}
                      onChange={(e) => onUpdate({ decimals: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
              
              {/* Common validation settings */}
              {["text", "textarea", "email", "phone", "url"].includes(field.type) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Length</Label>
                      <Input
                        id={`${field.id}-min`}
                        type="number"
                        value={field.validation?.min || ""}
                        onChange={(e) => 
                          onUpdate({
                            validation: {
                              ...field.validation,
                              min: parseInt(e.target.value) || undefined
                            }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Length</Label>
                      <Input
                        id={`${field.id}-max`}
                        type="number"
                        value={field.validation?.max || ""}
                        onChange={(e) =>
                          onUpdate({
                            validation: {
                              ...field.validation,
                              max: parseInt(e.target.value) || undefined
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Pattern (Regex)</Label>
                    <Input
                      id={`${field.id}-pattern`}
                      value={field.validation?.pattern || ""}
                      onChange={(e) =>
                        onUpdate({
                          validation: {
                            ...field.validation,
                            pattern: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </>
              )}
              
              {["number", "percentage"].includes(field.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Value</Label>
                    <Input
                      type="number"
                      value={field.validation?.min ?? ""}
                      onChange={(e) => 
                        onUpdate({
                          validation: {
                            ...field.validation,
                            min: e.target.value ? Number(e.target.value) : undefined
                          }
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Value</Label>
                    <Input
                      type="number"
                      value={field.validation?.max ?? ""}
                      onChange={(e) =>
                        onUpdate({
                          validation: {
                            ...field.validation,
                            max: e.target.value ? Number(e.target.value) : undefined
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Custom Error Message</Label>
                <Input
                  id={`${field.id}-error`}
                  value={field.validation?.customError || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        customError: e.target.value
                      }
                    })
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}