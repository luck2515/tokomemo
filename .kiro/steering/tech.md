# Technology Stack & Architecture

## Architecture
- **Type**: Single Page Application (SPA) / Progressive Web App (PWA)
- **Pattern**: Client-side rendering with Backend-as-a-Service (BaaS).
- **State Management**: React `useState` and `useEffect` centralized in `App.tsx` for global data, passed down via props.

## Frontend
- **Core**: React 19, TypeScript.
- **Styling**: Tailwind CSS (Utility-first).
- **Icons**: Heroicons (SVG implementation via `constants.tsx`).
- **Bundling/Runtime**: ES Modules native (via `index.html` importmap).

## Backend (Supabase)
- **Authentication**: Supabase Auth (Email/Password).
- **Database**: PostgreSQL.
- **Storage**: Supabase Storage (Bucket: `photos`).
- **Security**: Row Level Security (RLS) policies strictly enforced for `spots`, `visits`, `profiles`, and `photos`.
- **RPC Functions**: Custom PostgreSQL functions (e.g., `check_email_exists`) for specific logic.

## AI Integration
- **Provider**: Google Gemini API (`@google/genai`).
- **Model**: `gemini-2.5-flash`.
- **Tools**: Google Search Grounding for real-time information retrieval from URLs.

## Database Schema (Key Tables)
1. **profiles**: User identity, pairing codes, partner linkage.
2. **spots**: Core location data, scope ('personal', 'shared'), status.
3. **visits**: Records linked to spots (rating, bill, visited_at).
4. **photos**: Image references linked to spots or visits.

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API Endpoint.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API Key for RLS-protected access.
- `API_KEY`: Google Gemini API Key.

## Development Tools
- **Formatting**: Prettier/ESLint logic implied.
- **Type Checking**: TypeScript strict mode.