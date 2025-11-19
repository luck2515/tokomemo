# Tokomemo Product Overview

## Product Overview
Tokomemo is a Progressive Web Application (PWA) designed for individuals and couples to centrally manage their favorite spots, visit records, photos, and memories. It simplifies the process of logging restaurant and location data by utilizing AI to automatically extract information from URLs, and offers seamless data sharing between partners through a pairing system.

## Core Features
- **Spot Management**: Create, read, update, and delete spots with details like photos, tags, and status.
- **Visit History**: Log multiple visits to a single spot, including ratings, bills, memos, and photos.
- **Smart AI Completion**: Automatically fetch and fill spot details (name, hours, price, etc.) from a URL using Google Gemini API (with Google Search grounding).
- **Partner Pairing**: Connect with a partner using a pairing code to view and manage shared spots ("Shared" or "Both" scope).
- **Status Tracking**: Categorize spots as "Want to go", "Visited", or "Revisit" with visual indicators.
- **Photo Management**: Upload and organize photos via Supabase Storage, linked to specific spots or visits.
- **Optimistic UI**: Instant feedback on user actions (like adding/deleting spots) for a smooth app-like experience.
- **PWA Capabilities**: Offline support detection and mobile-optimized design with safe-area handling.

## Target Use Case
- **Individuals**: Keeping a personal log of restaurants to visit or revisiting favorite memories.
- **Couples**: Planning dates by sharing a "Want to go" list and looking back on shared dining experiences and photos.

## Key Value Proposition
- **Reduced Input Load**: AI integration removes the tediousness of manual data entry for spot details.
- **Shared Experience**: Dedicated features for couples to manage shared memories without complex permissions.
- **Visual & Intuitive**: Photo-centric UI with clear status indicators makes browsing memories enjoyable.
- **Privacy & Security**: Row Level Security (RLS) ensures data is strictly controlled between the user and their partner.