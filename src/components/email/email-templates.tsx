import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { EmailTemplateDialog } from "./email-template-dialog"
import { EmailTemplateList } from "./email-template-list"
import { EmailTemplateType } from "@prisma/client"

export function EmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/email/templates")
      if (!response.ok) throw new Error("Failed to fetch templates")
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    try {
      const response = await fetch(`/api/email/templates/${templateId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete template")
      
      setTemplates(templates.filter(t => t.id !== templateId))
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Templates</CardTitle>
        <EmailTemplateDialog onSave={fetchTemplates} />
      </CardHeader>
      <CardContent>
        <EmailTemplateList
          templates={templates}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={fetchTemplates}
        />
      </CardContent>
    </Card>
  )
}