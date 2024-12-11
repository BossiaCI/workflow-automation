import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Overview
      </Link>
      <Link
        href="/dashboard/forms"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/forms"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Forms
      </Link>
      <Link
        href="/dashboard/users"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/users"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Users
      </Link>
      <Link
        href="/dashboard/analytics"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/analytics"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Analytics
      </Link>
    </nav>
  )
}