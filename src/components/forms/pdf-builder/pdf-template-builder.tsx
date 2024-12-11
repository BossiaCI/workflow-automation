import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { PdfPreview } from "./pdf-preview"
import { PdfElementSettings } from "./pdf-element-settings"
import { PdfLayoutEditor } from "./pdf-layout-editor"
import { PdfFieldValidation } from "./pdf-field-validation"
import { PdfFieldMapping } from "./pdf-field-mapping"
import { PdfTemplatesList } from "./pdf-templates-list"
import { PdfTemplateDialog } from "./pdf-template-dialog"
import { PdfFieldMapping } from "./pdf-field-mapping"
import { useFormBuilder } from "../form-builder/form-builder-context"
import { checkSubscriptionLimits } from "@/lib/api/subscription"

export function PdfTemplateBuilder() {
  const { formData } = useFormBuilder()
  const { toast } = useToast()
  const [selectedElement, setSelectedElement] = useState(null)
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [fieldMappings, setFieldMappings] = useState([])
  const [limits, setLimits] = useState(null)
  const [fieldMappings, setFieldMappings] = useState([])
  const [previewData, setPreviewData] = useState({})
  const [pdfLayout, setPdfLayout] = useState({
    elements: [],
    settings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
  })

  useEffect(() => {
    Promise.all([
      fetchTemplates(),
      fetchLimits(),
    ])
  }, [])

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/users/me/subscription/limits')
      if (!response.ok) throw new Error("Failed to fetch limits")
      const data = await response.json()
      setLimits(data.limits)
    } catch (error) {
      console.error("Error fetching limits:", error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/forms/${formData.id}/pdf-templates`)
      if (!response.ok) throw new Error("Failed to fetch templates")
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const handleTemplateSelect = async (template) => {
    try {
      const response = await fetch(`/api/forms/${formData.id}/pdf-templates/${template.id}`)
      if (!response.ok) throw new Error("Failed to fetch template")
      const data = await response.json()
      
      setSelectedTemplate(template)
      setPdfLayout({
        elements: data.elements,
        settings: data.settings,
      })
      setFieldMappings(data.fieldMappings || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      })
    }
  }

  const handleTemplateDelete = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId))
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
      setPdfLayout({ elements: [], settings: defaultSettings })
      setFieldMappings([])
    }
  }

  const handleSaveTemplate = async () => {
    try {
      const response = await fetch(`/api/forms/${formData.id}/pdf-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Template " + (templates.length + 1),
          elements: pdfLayout.elements,
          settings: pdfLayout.settings,
          fieldMappings,
          fieldMappings,
        }),
      })

      if (response.status === 403) {
        toast({
          title: "Template limit reached",
          description: "Upgrade to Premium for unlimited PDF templates",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) throw new Error("Failed to save template")

      const savedTemplate = await response.json()
      setTemplates([...templates, savedTemplate])
      
      toast({
        title: "Success",
        description: "PDF template saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save PDF template",
        variant: "destructive",
      })
    }
  }

  const handleElementSelect = (element) => {
    setSelectedElement(element)
  }

  const handleLayoutUpdate = (newLayout) => {
    setPdfLayout(newLayout)
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>PDF Template Editor</CardTitle>
                <CardDescription>
                  {limits && `${templates.length} / ${limits.pdfTemplates.limit} templates used`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <PdfTemplateDialog
                  formId={formData.id}
                  onSave={fetchTemplates}
                />
                {selectedTemplate && (
                  <Button onClick={handleSaveTemplate}>
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardDescription className="px-6">
            {templates.length} / {PLAN_FEATURES[user?.plan || "FREE"].maxPdfTemplates} templates used
          </CardDescription>
          <CardContent>
            <Tabs defaultValue="design">
              <TabsList>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              <TabsContent value="design">
                <PdfLayoutEditor
                  layout={pdfLayout}
                  onLayoutUpdate={handleLayoutUpdate}
                  onElementSelect={handleElementSelect}
                  formFields={formData.fields}
                />
              </TabsContent>
              <TabsContent value="preview">
                <PdfPreview
                  layout={pdfLayout}
                  formData={formData}
                  fieldMappings={fieldMappings}
                  previewData={previewData}
                />
              </TabsContent>
              <TabsContent value="validation">
                <PdfFieldValidation
                  formId={formData.id}
                  templateId={selectedTemplate?.id}
                  mappings={fieldMappings}
                  pageSize={{
                    width: pdfLayout.settings.pageSize === 'A4' ? 595 : 612,
                    height: pdfLayout.settings.pageSize === 'A4' ? 842 : 792,
                  }}
                />
              </TabsContent>
              <TabsContent value="mappings">
                <PdfFieldMapping
                  formFields={formData.fields}
                  mappings={fieldMappings}
                  onUpdate={setFieldMappings}
                />
              </TabsContent>
              <TabsContent value="templates">
                <PdfTemplatesList
                  formId={formData.id}
                  templates={templates}
                  onEdit={handleTemplateSelect}
                  onDelete={handleTemplateDelete}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-4">
        <PdfElementSettings
          element={selectedElement}
          onUpdate={(updates) => {
            const newLayout = {
              ...pdfLayout,
              elements: pdfLayout.elements.map((el) =>
                el.id === selectedElement?.id ? { ...el, ...updates } : el
              ),
            }
            setPdfLayout(newLayout)
          }}
        />
      </div>
    </div>
  )
}