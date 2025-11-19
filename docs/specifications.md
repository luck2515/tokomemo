# Tokomemo Specification Document

## 1. Project Overview
Tokomemo is a Progressive Web Application (PWA) designed for individuals and couples to manage their "Want to Go" and "Visited" spots. It focuses on ease of input via AI and seamless sharing between partners.

## 2. Core Features

### Spot Management
- **CRUD**: Create, Read, Update, Delete spots.
- **Status**: Want to go, Visited, Revisit.
- **Details**: Name, Photo, Tags, URL, Address, Phone, Hours, Price, Payment, Memo.
- **Scope**: Personal (Private), Shared (Partner visible).

### Visit History
- Log multiple visits per spot.
- Record Rating, Bill, Date, Memo, and Photos.

### AI Integration (Gemini 2.5 Flash)
- **Input**: URL.
- **Output**: Structured JSON (Name, Address, Hours, etc.) + Summary.
- **Tool**: Google Search Grounding.

### Partner Pairing
- **Mechanism**: One-way code generation, two-way DB linking.
- **Effect**: Unlocks "Shared" scope visibility.

## 3. User Plans & Limits

| Feature | Free Plan | Supporter | Couple Plan |
| :--- | :--- | :--- | :--- |
| **Condition** | Default | (Future Impl) | Paired with Partner |
| **Photo Storage** | Max **50** images | Max **500** images | **Unlimited** |
| **AI Completion** | Max **10** times/mo | Max **50** times/mo | Max **100** times/mo |

*Note: Storage limits count the total number of photos owned by the user. AI limits are reset monthly.*

## 4. Database Schema (Supabase)

### `profiles`
- `id` (uuid, PK): Linked to auth.users.
- `email` (text): User email.
- `pairing_code` (text): Unique code for pairing.
- `partner_id` (uuid): Linked partner's profile ID.

### `spots`
- `id` (uuid, PK)
- `user_id` (uuid): Owner.
- `status` (text): 'want_to_go' | 'visited' | 'revisit'
- `scope` (text): 'personal' | 'shared' | 'both'
- `...details`: (name, url, address, etc.)

### `visits`
- `id` (uuid, PK)
- `spot_id` (uuid): Parent spot.
- `user_id` (uuid): Creator.
- `...details`: (rating, memo, bill, visited_at)

### `photos`
- `id` (uuid, PK)
- `url` (text): Public URL from Storage.
- `user_id` (uuid): Owner.
- `spot_id` (uuid, optional)
- `visit_id` (uuid, optional)

## 5. Technical Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **Backend**: Supabase (Auth, DB, Storage).
- **Deployment**: Vercel / Cloudflare Pages.
- **PWA**: Manifest + Service Worker (Future).
