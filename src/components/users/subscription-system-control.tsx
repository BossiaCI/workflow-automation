import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function SubscriptionSystemControl() {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/subscription-system')
      if (!response.ok) throw new Error('Failed to fetch status')
      const data = await response.json()
      setIsActive(data.active)
    } catch (error) {
      console.error('Error fetching status:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subscription system status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/subscription-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isActive }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      setIsActive(!isActive)
      toast({
        title: "Success",
        description: `Subscription system ${!isActive ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update subscription system status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription System Control</CardTitle>
        <CardDescription>
          Enable or disable subscription-based restrictions across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
              <Label>
                {isActive ? "Subscription system active" : "Subscription system inactive"}
              </Label>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}