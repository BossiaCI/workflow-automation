import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EmailSettings } from "@/components/email/email-settings"
import { EmailTemplates } from "@/components/email/email-templates"
import { EmailWorkflows } from "@/components/email/email-workflows"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Email Management",
  description: "Manage email settings, templates, and workflows",
}

export default async function EmailPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Management</h2>
        <p className="text-muted-foreground">
          Configure email settings, templates, and automation workflows
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <EmailSettings />
        </TabsContent>
        <TabsContent value="templates">
          <EmailTemplates />
        </TabsContent>
        <TabsContent value="workflows">
          <EmailWorkflows />
        </TabsContent>
      </Tabs>
    </div>
  )
}