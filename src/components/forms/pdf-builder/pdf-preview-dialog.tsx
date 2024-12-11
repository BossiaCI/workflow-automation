import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Eye } from 'lucide-react'

interface PdfPreviewDialogProps {
  formId: string
  templateId: string
  previewData?: Record<string, any>
}

export function PdfPreviewDialog({
  formId,
  templateId,
  previewData,
}: PdfPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>()

  const handlePreview = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/forms/${formId}/pdf-mappings/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          data: previewData,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate preview')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (error) {
      console.error('Error generating preview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] sm:h-[800px]">
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
          <DialogDescription>
            Preview how your PDF will look with the current mappings
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Generating preview...
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border rounded-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No preview available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}