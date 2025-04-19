"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, AlertCircle, CreditCard } from "lucide-react"
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  createCheckoutSession,
  createPortalSession,
} from "@/api/subscriptions"
import type { RootState } from "@/store"
import type { SubscriptionPlan, UserSubscription } from "@/types/subscription"

export default function Subscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [plansData, subscriptionData] = await Promise.all([getSubscriptionPlans(), getCurrentSubscription()])

        setPlans(plansData)
        setCurrentSubscription(subscriptionData)
      } catch (err) {
        setError("Failed to load subscription data. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubscribe = async (priceId: string) => {
    setCheckoutLoading(priceId)
    setError(null)

    try {
      const { url } = await createCheckoutSession(priceId)
      window.location.href = url
    } catch (err) {
      setError("Failed to create checkout session. Please try again.")
      console.error(err)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (err) {
      setError("Failed to open customer portal. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const isSubscribed = currentSubscription?.status === "active" || currentSubscription?.status === "trialing"
  const currentPlanId = currentSubscription?.price?.id

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSubscribed && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Current Plan: {currentSubscription?.product?.name}
                </h3>
                <p className="text-sm text-green-700">
                  {currentSubscription?.status === "trialing"
                    ? `Trial ends on ${new Date(currentSubscription.trial_end!).toLocaleDateString()}`
                    : `Renews on ${new Date(currentSubscription?.current_period_end!).toLocaleDateString()}`}
                </p>
              </div>
              <Button variant="outline" onClick={handleManageSubscription} disabled={isLoading}>
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="monthly">
        <TabsList className="mb-6">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="flex flex-col">
                      <CardHeader>
                        <Skeleton className="h-7 w-24 mb-2" />
                        <Skeleton className="h-6 w-full" />
                      </CardHeader>
                      <CardContent className="flex-1">
                        <Skeleton className="h-10 w-28 mb-6" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))
              : plans
                  .filter((plan) => plan.interval === "month")
                  .map((plan) => (
                    <Card key={plan.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{plan.name}</CardTitle>
                          {plan.popular && <Badge>Popular</Badge>}
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="mb-6">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={currentPlanId === plan.priceId ? "outline" : "default"}
                          disabled={checkoutLoading === plan.priceId || currentPlanId === plan.priceId}
                          onClick={() => handleSubscribe(plan.priceId)}
                        >
                          {checkoutLoading === plan.priceId ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : currentPlanId === plan.priceId ? (
                            "Current Plan"
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
          </div>
        </TabsContent>

        <TabsContent value="yearly">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="flex flex-col">
                      <CardHeader>
                        <Skeleton className="h-7 w-24 mb-2" />
                        <Skeleton className="h-6 w-full" />
                      </CardHeader>
                      <CardContent className="flex-1">
                        <Skeleton className="h-10 w-28 mb-6" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))
              : plans
                  .filter((plan) => plan.interval === "year")
                  .map((plan) => (
                    <Card key={plan.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{plan.name}</CardTitle>
                          {plan.popular && <Badge>Popular</Badge>}
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="mb-6">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/year</span>
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={currentPlanId === plan.priceId ? "outline" : "default"}
                          disabled={checkoutLoading === plan.priceId || currentPlanId === plan.priceId}
                          onClick={() => handleSubscribe(plan.priceId)}
                        >
                          {checkoutLoading === plan.priceId ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : currentPlanId === plan.priceId ? (
                            "Current Plan"
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
