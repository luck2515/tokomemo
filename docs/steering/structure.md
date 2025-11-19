# Project Structure

## Directory Overview

```
/
├── components/       # Reusable UI components
│   ├── skeletons/    # Loading state placeholders
├── docs/             # Documentation
│   └── steering/     # Project specifications & guides
├── lib/              # External service configurations (Supabase)
├── screens/          # Full-page views and major modals
├── App.tsx           # Main Controller (Router, State, Data Fetching)
├── constants.tsx     # Shared resources (Icons, static data)
├── index.html        # Entry point (Importmaps, Tailwind)
├── index.tsx         # React mounting
└── types.ts          # TypeScript definitions (DB Schema matching)
```

## Key Files & Responsibilities

### Core
- **`App.tsx`**: The heart of the application.
  - Initializes Supabase session.
  - Fetches initial data (`fetchProfileAndSpots`).
  - Handles routing (`screen` state).
  - Defines global actions (`handleSaveSpot`, `handleUpdateSpot`).
- **`types.ts`**: Defines the shape of data.
  - `Spot`, `Visit`, `Photo`, `UserProfile`.
  - `AppScreen`: Defines all possible navigation states.

### Screens (Views)
- **`HomeScreen.tsx`**: Displays the grid of spots. Implements infinite scroll and filtering.
- **`SpotDetailModal.tsx`**: Detailed view of a spot. Implemented as a modal to overlay on Home.
- **`SpotForm.tsx`**: Create/Edit form. Handles AI generation and image uploading.
- **`SettingsScreen.tsx`**: User preferences, theme toggling, logout.
- **`PairingScreen.tsx`**: Logic for linking two user accounts.

### Components
- **`Header.tsx`**: Collapsible top navigation bar.
- **`BottomNavigation.tsx`**: Main tab switching.
- **`SpotCard.tsx`**: The card UI for a single spot in the list.
- **`SearchBar.tsx`**: Search input and filter logic (Tags, Status).

## Routing Concept
The app uses a "Virtual View" system rather than URL-based routing.

**Type Definition:**
```typescript
export type AppScreen = 
  | { view: 'home' }
  | { view: 'spot-detail'; spotId: string }
  | { view: 'spot-form'; spotId?: string }
  ...
```

**Mechanism:**
1. `App.tsx` holds `const [screen, setScreen] = useState<AppScreen>({ view: 'home' })`.
2. Based on `screen.view`, it renders the appropriate component.
3. Modals (like `SpotDetail`) are rendered conditionally *on top* of the layout, or replacing the content area, depending on the desired UX.

## Data Flow
1. **Auth**: User logs in -> `onAuthStateChange` triggers.
2. **Fetch**: `fetchProfileAndSpots` gets user profile and all relevant spots (including partner's).
3. **Distribute**: Data is passed to `HomeScreen` via props.
4. **Action**: User adds a spot -> `handleSaveSpot` in `App.tsx` is called -> Optimistic update -> DB Insert.