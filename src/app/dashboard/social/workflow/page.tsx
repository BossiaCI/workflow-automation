import { Metadata } from "next"
import { WorkflowBuilder } from "@/components/social/workflow/workflow-builder"

export const metadata: Metadata = {
  title: "Social Media Workflow",
  description: "Build and automate your social media workflows",
}

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workflow Builder</h2>
        <p className="text-muted-foreground">
          Create automated workflows for your social media content
        </p>
      </div>

      <WorkflowBuilder />
    </div>
  )
}