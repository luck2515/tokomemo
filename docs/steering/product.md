# Tokomemo Product Overview

## Product Overview
**Tokomemo (とこメモ)** is a Progressive Web Application (PWA) designed for individuals and couples to centrally manage their favorite spots (restaurants, cafes, sightseeing locations), visit records, photos, and memories. 

Unlike generic map apps, Tokomemo focuses on "Memory Keeping" and "Relationship Building," allowing users to maintain a curated list of places they want to visit or have visited, with deep integration for sharing these experiences with a partner.

## Core Features

### 1. Spot Management
- **CRUD Operations**: Users can create, read, update, and delete spots.
- **Status Tracking**: Spots are categorized as:
  - `Want to go` (行きたい): Future plans.
  - `Visited` (行った): Logged memories.
  - `Revisit` (再訪したい): Favorites to visit again.
- **Rich Details**: Stores tags, memos, photos, opening hours, prices, and payment methods.

### 2. AI-Powered Completion
- **Smart Input**: Utilizing the **Google Gemini API (2.5 Flash)** with Google Search Grounding.
- **Automation**: Users simply paste a URL, and the system extracts and fills in:
  - Store Name
  - Address & Phone
  - Business Hours
  - Price Range & Payment Methods
  - Summarized Memo (Reviews/Recommendations)

### 3. Partner Pairing (Couple Features)
- **Connection**: Users link accounts via a unique Pairing Code.
- **Scope Control**: Spots can be set to:
  - `Personal`: Private to the user.
  - `Shared`: Visible to the partner.
  - `Both` (implicit): Shared logic allows viewing partner's 'Shared' spots.
- **Unified View**: A specific "Shared" tab allows couples to plan dates easily.

### 4. Visit Logging
- **History**: Multiple visits can be recorded for a single spot.
- **Details**: Each visit logs the date, rating (1-5 stars), bill amount, memo, and specific photos for that occasion.

### 5. Photo Management
- **Cloud Storage**: Integration with Supabase Storage.
- **Context**: Photos are linked to either the Spot (general) or a specific Visit (time-bound).

## User Experience (UX) Focus
- **Optimistic UI**: Actions (like adding spots or updating status) reflect immediately on the screen before the server confirms, ensuring a snappy, app-like feel.
- **Mobile First**: Designed with bottom navigation, touch-friendly tap targets, and safe-area awareness for iOS/Android PWAs.
- **Offline Awareness**: Detects network status and notifies the user if they are offline.

## Target Audience
- **Foodies & Explorers**: People who keep lists of restaurants in Notes apps or browser bookmarks.
- **Couples**: Partners who want a shared repository of "places we want to go" without setting up complex shared calendars or Notion pages.