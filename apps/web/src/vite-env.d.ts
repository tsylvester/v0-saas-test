/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_POSTHOG_API_KEY?: string
  readonly VITE_CHATWOOT_WEBSITE_TOKEN?: string
  readonly VITE_CONVERTKIT_FORM_ID?: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
