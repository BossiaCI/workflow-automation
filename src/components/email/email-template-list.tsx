import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { EmailTemplateDialog } from "./email-template-dialog"
import { Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface EmailTemplateListProps {
  templates: any[]
  isLoading: boolean
  onDelete: (id: string) => void
  onEdit: () => void
}

export function EmailTemplateList({
  templates,
  isLoading,
  onDelete,
  onEdit,
}: EmailTemplateListProps) {
  if (isLoading) {
    return <div>Loading templates...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell>{template.name}</TableCell>
            <TableCell>{template.type}</TableCell>
            <TableCell>{formatDate(template.createdAt)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <EmailTemplateDialog
                  template={template}
                  onSave={onEdit}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this template? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(template.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {templates.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No templates found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}