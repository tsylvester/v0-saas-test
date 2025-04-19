import { logger } from "./logger"

interface AnalyticsOptions {
  googleAnalyticsId?: string
  posthogApiKey?: string
  chatwootWebsiteToken?: string
  convertKitFormId?: string
}

/**
 * Initialize analytics services if API keys are provided
 */
export function initAnalytics(): void {
  const options: AnalyticsOptions = {
    googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    posthogApiKey: import.meta.env.VITE_POSTHOG_API_KEY,
    chatwootWebsiteToken: import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN,
    convertKitFormId: import.meta.env.VITE_CONVERTKIT_FORM_ID,
  }

  logger.info("Initializing analytics services")

  // Initialize Google Analytics
  if (options.googleAnalyticsId) {
    logger.info("Initializing Google Analytics")
    initGoogleAnalytics(options.googleAnalyticsId)
  }

  // Initialize PostHog
  if (options.posthogApiKey) {
    logger.info("Initializing PostHog")
    initPosthog(options.posthogApiKey)
  }

  // Initialize Chatwoot
  if (options.chatwootWebsiteToken) {
    logger.info("Initializing Chatwoot")
    initChatwoot(options.chatwootWebsiteToken)
  }

  // Initialize ConvertKit
  if (options.convertKitFormId) {
    logger.info("Initializing ConvertKit")
    // ConvertKit is typically initialized when needed
  }
}

/**
 * Initialize Google Analytics
 */
function initGoogleAnalytics(measurementId: string): void {
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  gtag("js", new Date())
  gtag("config", measurementId)
}

/**
 * Initialize PostHog
 */
function initPosthog(apiKey: string): void {
  !((t, e) => {
    var o, n, p, r
    e.__SV ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = (i, s, a) => {
        function g(t, e) {
          var o = e.split(".")
          2 == o.length && ((t = t[o[0]]), (e = o[1])),
            (t[e] = () => {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
            })
        }
        ;((p = t.createElement("script")).type = "text/javascript"),
          (p.async = !0),
          (p.src = s.api_host + "/static/array.js"),
          (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r)
        var u = e
        for (
          void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
            u.people = u.people || [],
            u.toString = (t) => {
              var e = "posthog"
              return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
            },
            u.people.toString = () => u.toString(1) + ".people (stub)",
            o =
              "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(
                " ",
              ),
            n = 0;
          n < o.length;
          n++
        )
          g(u, o[n])
        e._i.push([i, s, a])
      }),
      (e.__SV = 1))
  })(document, window.posthog || [])
  window.posthog.init(apiKey, { api_host: "https://app.posthog.com" })
}

/**
 * Initialize Chatwoot
 */
function initChatwoot(websiteToken: string): void {
  window.chatwootSettings = {
    hideMessageBubble: false,
    position: "right",
    locale: "en",
    type: "standard",
  }
  ;((d, t) => {
    var BASE_URL = "https://app.chatwoot.com"
    var g = d.createElement(t),
      s = d.getElementsByTagName(t)[0]
    g.src = BASE_URL + "/packs/js/sdk.js"
    g.defer = true
    g.async = true
    s.parentNode.insertBefore(g, s)
    g.onload = () => {
      window.chatwootSDK.run({
        websiteToken,
        baseUrl: BASE_URL,
      })
    }
  })(document, "script")
}

/**
 * Track an event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  logger.debug("Tracking event", { eventName, properties })

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", eventName, properties)
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture(eventName, properties)
  }
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  logger.debug("Identifying user", { userId, traits })

  // PostHog
  if (window.posthog) {
    window.posthog.identify(userId, traits)
  }

  // Chatwoot
  if (window.$chatwoot) {
    window.$chatwoot.setUser(userId, {
      email: traits?.email,
      name: traits?.name,
      avatar_url: traits?.avatar_url,
    })
  }
}

// Add type definitions for window
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    posthog: any
    chatwootSettings: any
    $chatwoot: any
  }
}
