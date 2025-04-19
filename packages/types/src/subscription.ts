export interface Product {
  id: string
  name: string
  description?: string
  image?: string
  active: boolean
  metadata?: Record<string, any>
}

export interface Price {
  id: string
  product_id: string
  active: boolean
  currency: string
  description?: string
  type: "one_time" | "recurring"
  unit_amount: number
  interval?: "day" | "week" | "month" | "year"
  interval_count?: number
  trial_period_days?: number | null
  metadata?: Record<string, any>
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: "month" | "year"
  priceId: string
  features: string[]
  popular?: boolean
}

export interface UserSubscription {
  id: string
  status: "trialing" | "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "unpaid"
  price: {
    id: string
    product_id: string
    unit_amount: number
    interval?: string
    currency: string
  }
  product: {
    id: string
    name: string
    description?: string
    image?: string
  }
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  trial_end?: string | null
}

export interface CheckoutSessionResponse {
  url: string
}

export interface PortalSessionResponse {
  url: string
}
