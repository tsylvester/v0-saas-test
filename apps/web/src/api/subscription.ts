import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import type { Product, Price, UserSubscription, CheckoutSessionResponse, PortalSessionResponse } from "types"

/**
 * Get all products and prices
 */
export async function getProducts(): Promise<{ products: Product[]; prices: Price[] }> {
  logger.info("Getting products and prices")

  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name")

    if (productsError) {
      logger.error("Get products error", { error: productsError })
      throw productsError
    }

    // Get all prices
    const { data: prices, error: pricesError } = await supabase
      .from("prices")
      .select("*")
      .eq("active", true)
      .order("unit_amount")

    if (pricesError) {
      logger.error("Get prices error", { error: pricesError })
      throw pricesError
    }

    logger.info("Products and prices retrieved successfully", {
      productCount: products.length,
      priceCount: prices.length,
    })

    return {
      products: products as Product[],
      prices: prices as Price[],
    }
  } catch (error) {
    logger.error("Get products and prices error", { error })
    throw error
  }
}

/**
 * Get the current user's subscription
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  logger.info("Getting user subscription")

  try {
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      throw new Error("User not found")
    }

    // Get the subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*, prices(*), products(*)")
      .eq("user_id", user.user.id)
      .in("status", ["trialing", "active"])
      .maybeSingle()

    if (subscriptionError) {
      logger.error("Get subscription error", { error: subscriptionError })
      throw subscriptionError
    }

    if (!subscription) {
      logger.info("No active subscription found")
      return null
    }

    logger.info("Subscription retrieved successfully")
    return {
      id: subscription.id,
      status: subscription.status,
      price: {
        id: subscription.prices.id,
        product_id: subscription.prices.product_id,
        unit_amount: subscription.prices.unit_amount,
        interval: subscription.prices.interval,
        currency: subscription.prices.currency,
      },
      product: {
        id: subscription.products.id,
        name: subscription.products.name,
        description: subscription.products.description,
        image: subscription.products.image,
      },
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      created_at: subscription.created_at,
      trial_end: subscription.trial_end,
    }
  } catch (error) {
    logger.error("Get user subscription error", { error })
    throw error
  }
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession(priceId: string): Promise<CheckoutSessionResponse> {
  logger.info("Creating checkout session", { priceId })

  try {
    const { data, error } = await supabase.functions.invoke("transactions/create-checkout-session", {
      body: { priceId },
    })

    if (error) {
      logger.error("Create checkout session error", { error })
      throw error
    }

    logger.info("Checkout session created successfully")
    return data as CheckoutSessionResponse
  } catch (error) {
    logger.error("Create checkout session error", { error })
    throw error
  }
}

/**
 * Create a portal session for managing a subscription
 */
export async function createPortalSession(): Promise<PortalSessionResponse> {
  logger.info("Creating portal session")

  try {
    const { data, error } = await supabase.functions.invoke("transactions/create-portal-session")

    if (error) {
      logger.error("Create portal session error", { error })
      throw error
    }

    logger.info("Portal session created successfully")
    return data as PortalSessionResponse
  } catch (error) {
    logger.error("Create portal session error", { error })
    throw error
  }
}
