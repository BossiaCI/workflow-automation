import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Save, Loader2, Copy, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useFormBuilder } from "./form-builder-context"
import { PdfTemplateBuilder } from "../pdf-builder/pdf-template-builder"
import { formSchema } from "@/lib/validations/form"
import { FormTemplatesDialog } from "./form-templates-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export function FormHeader() {
  const { formData, setFormData, isPreview, setIsPreview, isSaving, setIsSaving } = useFormBuilder()
  const { toast } = useToast()
  const router = useRouter()
  const [showPdfBuilder, setShowPdfBuilder] = useState(false)

  const handleDuplicate = async () => {
    if (!formData.id) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/forms/${formData.id}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate form")
      }

      const duplicatedForm = await response.json()
      router.push(`/dashboard/forms/builder?id=${duplicatedForm.id}`)
      
      toast({
        title: "Success",
        description: "Form duplicated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate form",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.id) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/forms/${formData.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete form")
      }

      router.push("/dashboard/forms")
      
      toast({
        title: "Success",
        description: "Form deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Validate form data before saving
      const validatedData = formSchema.parse(formData)
      
      const response = await fetch("/api/forms", {
        method: formData.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })
      
      if (response.status === 400) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save form")
      }

      if (response.status === 403) throw new Error("Form limit reached for your plan")

      if (!response.ok) {
        throw new Error("Failed to save form")
      }

      const savedForm = await response.json()
      setFormData({ id: savedForm.id })
      
      toast({
        title: "Success",
        description: "Form saved successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to save form",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
      
      // Show upgrade prompt if form limit reached
      if (error instanceof Error && error.message.includes("limit reached")) {
        toast({
          title: "Upgrade your plan",
          description: "Upgrade to Premium to create unlimited forms",
          action: <Button onClick={() => router.push("/dashboard/billing")}>Upgrade</Button>
        })
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-4 flex-1 mr-4">
          <div className="flex items-center gap-4 mb-4">
            <FormTemplatesDialog />
          </div>
          <Input
            placeholder="Form Title"
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            className="text-2xl font-bold h-auto px-0 border-0 focus-visible:ring-0"
          />
          <Textarea
            placeholder="Form Description"
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            className="resize-none border-0 focus-visible:ring-0"
          />
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ type: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select form type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GUEST_RECEPTION">Guest Reception</SelectItem>
              <SelectItem value="BILLING">Billing</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {formData.id && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={isSaving}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      form and all its data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPdfBuilder(!showPdfBuilder)}
          >
            PDF Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>
      {showPdfBuilder && (
        <div className="mt-8">
          <PdfTemplateBuilder />
        </div>
      )}
    </div>
  )
}