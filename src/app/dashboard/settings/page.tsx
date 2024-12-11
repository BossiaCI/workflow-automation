import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SubscriptionSystemControl } from "@/components/users/subscription-system-control"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Settings",
  description: "System settings and configuration",
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage system settings and configurations
        </p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <SubscriptionSystemControl />
      </div>
    </div>
  )
}