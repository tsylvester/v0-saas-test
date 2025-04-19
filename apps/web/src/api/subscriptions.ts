import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import type { SubscriptionPlan, UserSubscription } from "@/types/subscription"

/**
 * Get available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  logger.info("Fetching subscription plans")

  // In a real app, this would come from the database or Stripe API
  // For this example, we'll use mock data
  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      description: "Essential features for individuals",
      price: 9.99,
      interval: "month",
      priceId: "price_basic_monthly",
      features: ["Unlimited chats", "Basic AI responses", "Email support"],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Advanced features for professionals",
      price: 19.99,
      interval: "month",
      priceId: "price_pro_monthly",
      features: ["Everything in Basic", "Advanced AI capabilities", "Priority support", "Custom chat templates"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Complete solution for teams",
      price: 49.99,
      interval: "month",
      priceId: "price_enterprise_monthly",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
      ],
      popular: false,
    },
    {
      id: "basic-yearly",
      name: "Basic",
      description: "Essential features for individuals",
      price: 99.99,
      interval: "year",
      priceId: "price_basic_yearly",
      features: ["Unlimited chats", "Basic AI responses", "Email support"],
      popular: false,
    },
    {
      id: "pro-yearly",
      name: "Pro",
      description: "Advanced features for professionals",
      price: 199.99,
      interval: "year",
      priceId: "price_pro_yearly",
      features: ["Everything in Basic", "Advanced AI capabilities", "Priority support", "Custom chat templates"],
      popular: true,
    },
    {
      id: "enterprise-yearly",
      name: "Enterprise",
      description: "Complete solution for teams",
      price: 499.99,
      interval: "year",
      priceId: "price_enterprise_yearly",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
      ],
      popular: false,
    },
  ]

  logger.info("Subscription plans fetched successfully")

  return plans
}

/**
 * Get the current user's subscription
 */
export async function getCurrentSubscription(): Promise<UserSubscription | null> {
  logger.info("Fetching current subscription")

  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    logger.error("No authenticated user found")
    throw new Error("You must be logged in to access subscription information")
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .eq("user_id", userData.user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    logger.error("Failed to fetch subscription", { error: error.message })
    throw new Error("Failed to fetch subscription information")
  }

  if (!data) {
    logger.info("No active subscription found")
    return null
  }

  logger.info("Subscription fetched successfully")

  return {
    id: data.id,
    status: data.status,
    current_period_end: data.current_period_end,
    cancel_at_period_end: data.cancel_at_period_end,
    created_at: data.created_at,
    trial_end: data.trial_end,
    price: {
      id: data.prices.id,
      product_id: data.prices.product_id,
      unit_amount: data.prices.unit_amount,
      interval: data.prices.interval,
      currency: data.prices.currency,
    },
    product: {
      id: data.prices.products.id,
      name: data.prices.products.name,
      description: data.prices.products.description,
      image: data.prices.products.image,
    },
  }
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession(priceId: string): Promise<{ url: string }> {
  logger.info("Creating checkout session", { priceId })

  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    logger.error("No authenticated user found")
    throw new Error("You must be logged in to subscribe")
  }

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { priceId },
  })

  if (error) {
    logger.error("Failed to create checkout session", { error })
    throw new Error("Failed to create checkout session")
  }

  if (!data || !data.url) {
    logger.error("Invalid response from checkout function")
    throw new Error("Failed to create checkout session")
  }

  logger.info("Checkout session created successfully")

  return { url: data.url }
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createPortalSession(): Promise<{ url: string }> {
  logger.info("Creating customer portal session")

  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    logger.error("No authenticated user found")
    throw new Error("You must be logged in to manage your subscription")
  }

  const { data, error } = await supabase.functions.invoke("create-portal-session", {
    body: {},
  })

  if (error) {
    logger.error("Failed to create portal session", { error })
    throw new Error("Failed to create portal session")
  }

  if (!data || !data.url) {
    logger.error("Invalid response from portal function")
    throw new Error("Failed to create portal session")
  }

  logger.info("Portal session created successfully")

  return { url: data.url }
}
