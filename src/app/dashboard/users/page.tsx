import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersDataTable } from "@/components/users/users-data-table"
import { UsersTableToolbar } from "@/components/users/users-table-toolbar"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users, roles, and permissions",
}

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <UsersTableToolbar />
        <UsersDataTable />
      </div>
    </div>
  )
}