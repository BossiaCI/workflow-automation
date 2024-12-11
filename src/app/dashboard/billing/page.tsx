import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { PLAN_FEATURES } from "@/lib/api/subscription"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription and billing",
}

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      plan: true,
      subscription: {
        include: {
          usage: true,
        },
      },
    },
  })

  const features = PLAN_FEATURES[user?.plan || "FREE"]
  const usage = user?.subscription?.usage

  const plans = [
    {
      name: "Free",
      description: "For individuals just getting started",
      price: "$0",
      features: PLAN_FEATURES.FREE.features,
      limits: {
        forms: `${usage?.formsCreated || 0}/${PLAN_FEATURES.FREE.maxForms} forms`,
        submissions: `${usage?.submissions || 0}/${PLAN_FEATURES.FREE.maxSubmissionsPerMonth} submissions/month`,
        storage: `${usage?.storage || 0}/${PLAN_FEATURES.FREE.maxStorage}MB storage`,
      },
      current: user?.plan === "FREE",
    },
    {
      name: "Premium",
      description: "For professionals and teams",
      price: "$19",
      features: PLAN_FEATURES.PREMIUM.features,
      limits: {
        forms: "Unlimited forms",
        submissions: "Unlimited submissions",
        storage: `${PLAN_FEATURES.PREMIUM.maxStorage}MB storage`,
      },
      current: user?.plan === "PREMIUM",
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.current ? "border-primary" : ""}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="mb-4 space-y-1">
                {Object.entries(plan.limits).map(([key, value]) => (
                  <p key={key} className="text-sm text-muted-foreground">
                    {value}
                  </p>
                ))}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current}
              >
                {plan.current ? (
                  user?.subscription?.cancelAtPeriodEnd ? "Canceled" : "Current Plan"
                ) : (
                  "Upgrade"
                )}
              </Button>
              {plan.current && !user?.subscription?.cancelAtPeriodEnd && (
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {}}
                >
                  Cancel Subscription
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}