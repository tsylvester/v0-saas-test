// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

// Declare Deno if it's not already available (e.g., in a testing environment)
declare var Deno: any

console.log("Hello from Stripe webhook function!")

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
  })

  const signature = req.headers.get("Stripe-Signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

    if (!webhookSecret) {
      throw new Error("Webhook secret not found")
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Create a Supabase client with the Admin API key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object

        // Create or update the subscription
        await handleCheckoutSessionCompleted(supabaseAdmin, session)
        break
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object

        // Update the subscription in the database
        await handleSubscriptionChange(supabaseAdmin, subscription)
        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object

        // Delete the subscription from the database
        await handleSubscriptionDeleted(supabaseAdmin, subscription)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})

async function handleCheckoutSessionCompleted(supabaseAdmin, session) {
  // Get the customer and subscription details
  const customerId = session.customer
  const subscriptionId = session.subscription
  const userId = session.metadata.userId

  // Store the customer and subscription details in the database
  const { error } = await supabaseAdmin.from("subscriptions").insert({
    id: subscriptionId,
    user_id: userId,
    customer_id: customerId,
    status: "active",
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error storing subscription:", error)
    throw error
  }
}

async function handleSubscriptionChange(supabaseAdmin, subscription) {
  // Update the subscription in the database
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      quantity: subscription.items.data[0].quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq("id", subscription.id)

  if (error) {
    console.error("Error updating subscription:", error)
    throw error
  }
}

async function handleSubscriptionDeleted(supabaseAdmin, subscription) {
  // Update the subscription status in the database
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    })
    .eq("id", subscription.id)

  if (error) {
    console.error("Error deleting subscription:", error)
    throw error
  }
}
