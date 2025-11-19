# Technology Stack & Architecture

## Overview
Tokomemo is built as a modern **Single Page Application (SPA)**. It relies on a "Backend-as-a-Service" (BaaS) architecture using Supabase, keeping the frontend logic centralized in React.

## Frontend Stack
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via CDN for runtime styling in this specific environment, typical setups would use PostCSS).
- **Icons**: Heroicons (implemented as raw SVGs in `constants.tsx` to avoid heavy icon library dependencies).
- **Bundling**: Browser-native ES Modules via `importmap` (Environment specific).

## Backend Infrastructure (Supabase)
The application relies entirely on Supabase for backend services.

### 1. Authentication (`auth`)
- **Provider**: Email/Password.
- **Flows**: Sign Up, Sign In, Password Reset, Session Management.
- **Triggers**: A PostgreSQL trigger automatically creates a `profile` entry upon user registration.

### 2. Database (`public` schema)
PostgreSQL is used with strong **Row Level Security (RLS)** policies.

| Table | Description | RLS Strategy |
|-------|-------------|--------------|
| `profiles` | User data, pairing codes, partner IDs. | Users view own; Partners view linked profile. |
| `spots` | Main entity (restaurants, places). | CRUD own; Read partner's if scope='shared'. |
| `visits` | Logs attached to spots. | CRUD own; Read partner's if spot is shared. |
| `photos` | Image references. | CRUD own; Viewable if linked spot is accessible. |

### 3. Storage (`storage`)
- **Bucket**: `photos`
- **Policy**: Public read access; Authenticated upload/delete (owners only).

## AI Integration
- **Service**: Google Gemini API.
- **Library**: `@google/genai`.
- **Model**: `gemini-2.5-flash`.
- **Features**: 
  - Uses `googleSearch` tool for grounding.
  - Extracts structured JSON data from unstructured web content (URLs).

## Key Architectural Decisions

### Routing
Instead of `react-router`, a custom state-based router is used:
- **State**: `screen` state in `App.tsx` (Type: `AppScreen`).
- **Benefit**: Allows keeping the "Home" state alive while showing modals (`SpotDetail`, `SpotForm`) as overlays, preserving scroll position and context.

### Global State Management
- **Central Store**: `App.tsx` serves as the single source of truth.
- **Data Flow**: Data (`spots`, `profile`) is fetched in `App.tsx` and passed down via props.
- **Optimistic Updates**: UI state is updated *before* the API call resolves to prevent UI lag.

### Security Model
- **Client-side**: Uses the Supabase **Anon Key**. This is safe because...
- **Server-side**: All logic is enforced via **PostgreSQL RLS Policies**. Even if a user manipulates the client code, they cannot access data not permitted by the RLS rules defined in the database.

## Environment Variables
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | URL of the Supabase project. |
| `SUPABASE_ANON_KEY` | Public key for client-side interaction. |
| `API_KEY` | Google Gemini API Key for AI features. |