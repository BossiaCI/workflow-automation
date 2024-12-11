import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formTemplates } from "@/lib/api/form-templates"
import { FormType } from "@prisma/client"
import { useFormBuilder } from "./form-builder-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FormTemplatesDialog() {
  const [open, setOpen] = useState(false)
  const { setFormData, setFields } = useFormBuilder()

  const handleSelectTemplate = (type: FormType) => {
    const template = formTemplates[type]
    setFormData({
      title: template.title,
      description: template.description,
      type,
      fields: template.fields,
    })
    setFields(template.fields)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Use Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Form Templates</DialogTitle>
          <DialogDescription>
            Choose a template to start with. You can customize it after.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(formTemplates).map(([type, template]) => (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary"
              onClick={() => handleSelectTemplate(type as FormType)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.fields.length} pre-configured fields
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )