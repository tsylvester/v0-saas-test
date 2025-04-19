# Full-Stack Monorepo Application

This monorepo contains a full-stack application with web and mobile clients, a RESTful API layer, and Supabase backend integration. The architecture follows a strict separation of concerns with independent layers that communicate only through defined interfaces.

## Architecture Overview

\`\`\`mermaid
graph TD;
    A["Frontend (Web/Mobile)"] --> B["API Layer"]
    C["State Store (Redux)"] --> B
    B --> D["Backend (Supabase Edge Functions)"]
    D --> E["Database (Supabase)"]
    F["Third-party Services (Stripe, OpenAI)"] --> D
\`\`\`

### Key Components:
- **Frontend**: Vite-powered web app and React Native mobile apps
- **API Layer**: RESTful endpoints for all functionality
- **State Management**: Redux for centralized state
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase with row-level security
- **Integrations**: Stripe, OpenAI, analytics tools (optional)

## Project Structure

\`\`\`
├── apps/
│   ├── web/                 # Vite web application
│   ├── mobile/              # React Native (Expo) mobile app
│   └── api/                 # API service
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── core/                # Core business logic
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── auth/            # Authentication functions
│   │   ├── database/        # Database operations
│   │   ├── transactions/    # Stripe integration
│   │   └── ai/              # OpenAI integration
│   └── migrations/          # Database migrations
└── config/                  # Configuration files
\`\`\`

## Features

- 🔐 Authentication (sign up, sign in, password reset)
- 👤 User profiles
- 💬 AI chat with history
- 💳 Stripe subscriptions
- 🌓 Light/dark mode
- 🎨 Themeable UI
- 📊 Analytics integrations (optional)

## Database Schema

### Tables

1. **profiles**
   - id (UUID, PK, references auth.users.id)
   - username (TEXT, UNIQUE)
   - full_name (TEXT)
   - avatar_url (TEXT)
   - website (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **chat_sessions**
   - id (UUID, PK)
   - user_id (UUID, references auth.users.id)
   - title (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **chat_messages**
   - id (UUID, PK)
   - chat_id (UUID, references chat_sessions.id)
   - user_id (UUID, references auth.users.id)
   - content (TEXT)
   - role (TEXT, CHECK IN ('user', 'assistant', 'system'))
   - created_at (TIMESTAMP)

4. **products** (for Stripe products)
   - id (TEXT, PK)
   - name (TEXT)
   - description (TEXT)
   - image (TEXT)
   - active (BOOLEAN)
   - metadata (JSONB)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

5. **prices** (for Stripe prices)
   - id (TEXT, PK)
   - product_id (TEXT, references products.id)
   - active (BOOLEAN)
   - currency (TEXT)
   - description (TEXT)
   - type (TEXT, CHECK IN ('one_time', 'recurring'))
   - unit_amount (INTEGER)
   - interval (TEXT, CHECK IN ('day', 'week', 'month', 'year'))
   - interval_count (INTEGER)
   - trial_period_days (INTEGER)
   - metadata (JSONB)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

6. **subscriptions** (for user subscriptions)
   - id (TEXT, PK)
   - user_id (UUID, references auth.users.id)
   - status (TEXT, CHECK IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'))
   - metadata (JSONB)
   - price_id (TEXT, references prices.id)
   - quantity (INTEGER)
   - cancel_at_period_end (BOOLEAN)
   - created_at (TIMESTAMP)
   - current_period_start (TIMESTAMP)
   - current_period_end (TIMESTAMP)
   - ended_at (TIMESTAMP)
   - cancel_at (TIMESTAMP)
   - canceled_at (TIMESTAMP)
   - trial_start (TIMESTAMP)
   - trial_end (TIMESTAMP)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start development server: `npm run dev`

## Deployment

- Frontend: Configured for Netlify
- Backend: Configured for Supabase

## Environment Variables

The application uses the following environment variables:

\`\`\`
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API
VITE_API_URL=http://localhost:3001

# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
VITE_POSTHOG_API_KEY=your_posthog_api_key
VITE_CHATWOOT_WEBSITE_TOKEN=your_chatwoot_website_token
VITE_CONVERTKIT_FORM_ID=your_convertkit_form_id
\`\`\`

## Build the user an app that meets these specs:

Vite
State management with Redux
Shadcn styles and components
Monorepo so the app can be deployed to web, iOS, and Android
A fully independent multi-layer API microservices architecture
Backend (Supabase edge functions) <-> API <-> Frontend
API <-> State store
The backend only talks to the API
The front end only talks to the API
The state store only talks to the API
The API is stateless
The state store stores all states and contexts
RESTful API endpoints for every function, component, and action
Comprehensive, verbose, specific, and thorough logging
Typescript with full types properly organized in a types folder
No internal or inline types or interfaces
Full database migrations, hooks, and triggers for all functions
Full row level security for the database
Instantiate the user and user profile in the database for each new user when they sign up
Use deno for the supabase edge and vite for the API and frontend
Prepared for database deployment to Supabase
Prepared for hosting deployment to Netlify
No hardcoded environmental variables, use an .env for all variables, keys, URLs, and other details the user will supply to the app
A light-mode / dark-mode switcher
A theme context so that the user can easily change color themes by inputting standardized variables
The app contents are:

A landing page that explains what the app does and has a call to action to sign up
Auth using Supabase including fully functional sign in, sign up, sign out, password change, email reset, account recovery
Each user profile element is independent and can be changed independently
Database using Supabase to save user profiles, chats, subscriptions, and transactions
Subscriptions using Stripe that sync the Stripe account to the database, use transactions, and automatically populate the Subscriptions page with cards for each product available on the Stripe account
An AI chatbox using OpenAI that saves the user chats to a history, allows users to select and continue prior chats
A user profile page that sets their name, user name, email address, password, and shows their current subscription
Google Analytics but disabled unless a key is added to .env
Posthog built in but disabled unless a key is added to .env
Chatwoot built in but disabled unless a key is added to .env
ConvertKit (now Kit) built in but disabled unless a key is added to .env
Configuration files for Supabase
Configuration files for Netlify
Create a duplicate of the web app for iOS using react-native and expo.

Create a duplicate of the web app for Androi


\`\`\`
