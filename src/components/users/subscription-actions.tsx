import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client"
import { Settings2 } from "lucide-react"

interface SubscriptionActionsProps {
  userId: string
  currentPlan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  onUpdate: () => void
}

export function SubscriptionActions({
  userId,
  currentPlan,
  subscriptionStatus,
  onUpdate,
}: SubscriptionActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAction = async (action: string, data: any = {}) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      })

      if (!response.ok) throw new Error("Failed to update subscription")

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Settings2 className="h-4 w-4 mr-2" />
          Manage
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Subscription Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction("UPDATE_PLAN", {
            plan: currentPlan === SubscriptionPlan.FREE
              ? SubscriptionPlan.PREMIUM
              : SubscriptionPlan.FREE
          })}
        >
          Switch to {currentPlan === SubscriptionPlan.FREE ? "Premium" : "Free"}
        </DropdownMenuItem>
        {subscriptionStatus === SubscriptionStatus.ACTIVE ? (
          <DropdownMenuItem
            onClick={() => handleAction("CANCEL")}
            className="text-destructive"
          >
            Cancel Subscription
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleAction("REACTIVATE")}
          >
            Reactivate Subscription
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        {Object.values(SubscriptionStatus).map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleAction("UPDATE_STATUS", { status })}
            disabled={status === subscriptionStatus}
          >
            Set to {status.toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}