# Project Structure & Organization

## Root Directory Organization
- **index.html**: Entry point, contains global styles, importmap, and PWA meta tags.
- **index.tsx**: React root mounting.
- **App.tsx**: Main application controller. Handles routing, auth state, data fetching, and global UI layout.
- **types.ts**: Centralized TypeScript interfaces (`Spot`, `Visit`, `UserProfile`, `AppScreen`) matching the DB schema.
- **constants.tsx**: Shared resources, primarily the Icon component library.
- **lib/**: Configuration and initialization of external services (Supabase).

## Subdirectory Structures

### `components/`
Reusable UI elements independent of business logic.
- **Navigation**: `BottomNavigation.tsx`, `Header.tsx`.
- **Display**: `SpotCard.tsx`, `StorageMeter.tsx`, `EmptyState.tsx`.
- **Feedback**: `UndoToast.tsx`, `OfflineBanner.tsx`.
- **Loaders**: `skeletons/SpotCardSkeleton.tsx`.

### `screens/`
Page-level or complex modal components handling specific views.
- **Auth**: `LoginScreen.tsx`, `SignUpScreen.tsx`, `UpdatePasswordScreen.tsx`.
- **Core**: `HomeScreen.tsx` (Listing), `SettingsScreen.tsx`.
- **Modals/Forms**: `SpotDetailModal.tsx`, `SpotForm.tsx`, `VisitFormModal.tsx`, `AiCompletionModal.tsx`.
- **Flows**: `WelcomeScreen.tsx`, `OnboardingScreen.tsx`, `PairingScreen.tsx`.

## Architectural Principles
- **Centralized Data Fetching**: `App.tsx` fetches profiles and spots on auth state change and distributes data to screens.
- **Modal Navigation**: Many "screens" (`spot-detail`, `spot-form`) are rendered as overlays/modals within `App.tsx` rather than distinct routes, preserving background context.
- **Optimistic Updates**: UI updates state immediately before confirming with the database to ensure responsiveness.
- **Self-Healing Data**: Logic exists (e.g., in `fetchProfileAndSpots`) to auto-create missing profiles if triggers fail.

## File Naming Conventions
- **Components/Screens**: PascalCase (e.g., `SpotCard.tsx`).
- **Utilities/Configs**: camelCase (e.g., `supabase.ts`).
- **Extensions**: `.tsx` for React components, `.ts` for logic/types.