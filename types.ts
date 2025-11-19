export type SpotStatus = "want_to_go" | "visited" | "revisit";

export interface Photo {
  id: string;
  url: string;
  spot_id?: string;
  visit_id?: string;
  created_at?: string;
  user_id?: string;
}

export interface Visit {
  id: string;
  visitedAt: string; // mapped from visited_at
  rating: number;
  memo: string;
  bill?: number;
  photos: Photo[];
  spot_id?: string;
  user_id?: string;
}

export interface Spot {
  id: string;
  user_id: string;
  name: string;
  status: SpotStatus;
  scope: 'personal' | 'shared' | 'both';
  coverPhotoUrl: string; // mapped from cover_photo_url
  lastVisitDate?: string; // derived
  isPinned: boolean; // mapped from is_pinned
  rating?: number; // derived
  visitCount?: number; // derived
  tags: string[];
  photos: Photo[];
  visits: Visit[];
  url?: string;
  memo?: string;
  phone?: string;
  address?: string;
  openingHours?: string[]; // mapped from opening_hours
  priceMin?: number; // mapped from price_min
  priceMax?: number; // mapped from price_max
  paymentMethods?: string[]; // mapped from payment_methods
  isOpenNow?: boolean;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  pairing_code: string;
  partner_id?: string;
}

export type AppScreen = 
  | { view: 'home' }
  | { view: 'spot-detail'; spotId: string }
  | { view: 'spot-form'; spotId?: string }
  | { view: 'visit-form'; spotId: string; visitId?: string }
  | { view: 'settings' }
  | { view: 'shared' }
  | { view: 'favorites' }
  | { view: 'pairing' }
  | { view: 'ai-completion'; spotId: string, completionData: Partial<Spot> }
  | { view: 'welcome' }
  | { view: 'login' }
  | { view: 'signup' }
  | { view: 'onboarding' };