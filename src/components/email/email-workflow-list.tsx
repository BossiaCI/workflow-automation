import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { EmailWorkflowDialog } from "./email-workflow-dialog"
import { Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface EmailWorkflowListProps {
  workflows: any[]
  isLoading: boolean
  onDelete: (id: string) => void
  onEdit: () => void
}

export function EmailWorkflowList({
  workflows,
  isLoading,
  onDelete,
  onEdit,
}: EmailWorkflowListProps) {
  if (isLoading) {
    return <div>Loading workflows...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workflows.map((workflow) => (
          <TableRow key={workflow.id}>
            <TableCell>{workflow.name}</TableCell>
            <TableCell>{workflow.trigger}</TableCell>
            <TableCell>{workflow.template?.name}</TableCell>
            <TableCell>
              <Switch
                checked={workflow.active}
                onCheckedChange={async (checked) => {
                  try {
                    const response = await fetch(`/api/email/workflows/${workflow.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ active: checked }),
                    })
                    if (!response.ok) throw new Error("Failed to update status")
                    onEdit()
                  } catch (error) {
                    console.error("Error updating workflow status:", error)
                  }
                }}
              />
            </TableCell>
            <TableCell>{formatDate(workflow.createdAt)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <EmailWorkflowDialog
                  workflow={workflow}
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
                      <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this workflow? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(workflow.id)}
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
        {workflows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No workflows found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}