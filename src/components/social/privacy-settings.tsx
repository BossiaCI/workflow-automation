import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ProfileVisibility, MessagePrivacy, ConnectionPrivacy } from '@prisma/client'

const privacySchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'CONNECTIONS', 'PRIVATE']),
  messagePrivacy: z.enum(['EVERYONE', 'CONNECTIONS', 'NONE']),
  connectionRequests: z.enum(['EVERYONE', 'MUTUAL_CONNECTIONS', 'VERIFIED_ONLY', 'NONE']),
  dataSharing: z.object({
    shareProfile: z.boolean(),
    shareActivity: z.boolean(),
    shareConnections: z.boolean(),
    shareInterests: z.boolean(),
    shareAnalytics: z.boolean(),
  }),
  thirdPartyAccess: z.object({
    allowApps: z.boolean(),
    allowAnalytics: z.boolean(),
    allowMarketing: z.boolean(),
    allowIntegrations: z.boolean(),
  }),
})

export function PrivacySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: 'PUBLIC' as ProfileVisibility,
      messagePrivacy: 'CONNECTIONS' as MessagePrivacy,
      connectionRequests: 'EVERYONE' as ConnectionPrivacy,
      dataSharing: {
        shareProfile: true,
        shareActivity: true,
        shareConnections: true,
        shareInterests: true,
        shareAnalytics: false,
      },
      thirdPartyAccess: {
        allowApps: true,
        allowAnalytics: true,
        allowMarketing: false,
        allowIntegrations: true,
      },
    },
  })

  const onSubmit = async (data: z.infer<typeof privacySchema>) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/social/settings/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update privacy settings')

      toast({
        title: 'Success',
        description: 'Privacy settings updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-4">
            <h3 className="font-medium">Profile Visibility</h3>
            <Select
              value={form.watch('profileVisibility')}
              onValueChange={(value: ProfileVisibility) =>
                form.setValue('profileVisibility', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="CONNECTIONS">Connections Only</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Message Privacy */}
          <div className="space-y-4">
            <h3 className="font-medium">Message Privacy</h3>
            <Select
              value={form.watch('messagePrivacy')}
              onValueChange={(value: MessagePrivacy) =>
                form.setValue('messagePrivacy', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EVERYONE">Everyone</SelectItem>
                <SelectItem value="CONNECTIONS">Connections Only</SelectItem>
                <SelectItem value="NONE">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Connection Requests */}
          <div className="space-y-4">
            <h3 className="font-medium">Connection Requests</h3>
            <Select
              value={form.watch('connectionRequests')}
              onValueChange={(value: ConnectionPrivacy) =>
                form.setValue('connectionRequests', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EVERYONE">Everyone</SelectItem>
                <SelectItem value="MUTUAL_CONNECTIONS">Mutual Connections</SelectItem>
                <SelectItem value="VERIFIED_ONLY">Verified Users Only</SelectItem>
                <SelectItem value="NONE">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Data Sharing */}
          <div className="space-y-4">
            <h3 className="font-medium">Data Sharing</h3>
            <div className="space-y-4">
              {Object.entries(form.watch('dataSharing')).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      form.setValue(`dataSharing.${key}`, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Third-Party Access */}
          <div className="space-y-4">
            <h3 className="font-medium">Third-Party Access</h3>
            <div className="space-y-4">
              {Object.entries(form.watch('thirdPartyAccess')).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      form.setValue(`thirdPartyAccess.${key}`, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        Save Privacy Settings
      </Button>
    </form>
  )
}