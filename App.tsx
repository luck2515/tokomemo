
import React, { useState, useMemo, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import BottomNavigation from './components/BottomNavigation';
import SpotDetailModal from './screens/SpotDetailModal';
import SpotForm from './screens/SpotForm';
import SettingsScreen from './screens/SettingsScreen';
import VisitFormModal from './screens/VisitFormModal';
import AiCompletionModal from './screens/AiCompletionModal';
import OfflineBanner from './components/OfflineBanner';
import UndoToast from './components/UndoToast';
import PairingScreen from './screens/PairingScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { AppScreen, Spot, Visit, UserProfile } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Icon } from './constants';

type Theme = 'system' | 'light' | 'dark';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [screen, setScreen] = useState<AppScreen>({ view: 'welcome' });
  const [isOffline, setIsOffline] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'supporter' | 'couple'>('free'); 
  const [showUndo, setShowUndo] = useState(false);
  const [previousSpotState, setPreviousSpotState] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings
  const [theme, setTheme] = useState<Theme>('system');
  const [tagSearchMode, setTagSearchMode] = useState<'or' | 'and'>('or');

  // Auth & Onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // --- Initialization & Auth ---

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfileAndSpots(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfileAndSpots(session.user.id);
      } else {
        setSpots([]);
        setProfile(null);
        setScreen({ view: 'welcome' });
        setLoading(false);
      }
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const isModalOpen = ['spot-detail', 'spot-form', 'visit-form', 'ai-completion'].includes(screen.view);
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [screen.view]);

  // --- Data Fetching ---

  const fetchProfileAndSpots = async (userId: string) => {
    setLoading(true);
    try {
        // 1. Fetch Profile
        let { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // Self-healing: If profile doesn't exist (trigger failed), create it
        if (!profileData) {
            const { data: userData } = await supabase.auth.getUser();
            const email = userData.user?.email;
            const pairingCode = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
            
            const { data: newProfile } = await supabase
                .from('profiles')
                .insert([{ id: userId, email: email, pairing_code: pairingCode }])
                .select()
                .single();
            
            profileData = newProfile;
        }

        if (profileData) {
            setProfile(profileData as UserProfile);
            if (profileData.partner_id) setUserPlan('couple');
            
            // 2. Fetch Spots (Depend on profile for partner logic)
            await fetchSpots(userId, profileData.partner_id);
            setHasCompletedOnboarding(true); 
            setScreen({ view: 'home' });
        } else {
             // Should not happen with self-healing, but fallback
             setHasCompletedOnboarding(true);
             setScreen({ view: 'home' });
        }
    } catch (e) {
        console.error("Init error", e);
    } finally {
        setLoading(false);
    }
  };

  const fetchSpots = async (userId: string, partnerId?: string) => {
    let query = supabase
      .from('spots')
      .select(`
        *,
        visits (
          *,
          photos (*)
        ),
        photos (*)
      `)
      .order('created_at', { ascending: false });

    // Filter logic
    if (partnerId) {
        query = query.in('user_id', [userId, partnerId]);
    } else {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching spots:', error);
      return;
    }

    if (!data) return;

    // Client-side filtering for strict partner sharing rules
    const visibleSpots = data.filter((s: any) => {
        if (s.user_id === userId) return true;
        if (partnerId && s.user_id === partnerId) {
            return s.scope === 'shared' || s.scope === 'both';
        }
        return false;
    });

    // Map DB snake_case to TypeScript camelCase
    const mappedSpots: Spot[] = visibleSpots.map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      name: s.name,
      status: s.status,
      scope: s.scope,
      coverPhotoUrl: s.cover_photo_url || 'https://images.unsplash.com/photo-1559305417-7d2a45513555?q=80&w=300',
      isPinned: s.is_pinned,
      tags: s.tags || [],
      url: s.url,
      memo: s.memo,
      phone: s.phone,
      address: s.address,
      openingHours: s.opening_hours,
      priceMin: s.price_min,
      priceMax: s.price_max,
      paymentMethods: s.payment_methods,
      photos: s.photos || [],
      visits: (s.visits || []).map((v: any) => ({
        id: v.id,
        visitedAt: v.visited_at,
        rating: v.rating,
        memo: v.memo,
        bill: v.bill,
        photos: v.photos || [],
        spot_id: s.id
      })),
      // Derived fields
      rating: s.visits && s.visits.length > 0 
        ? s.visits.reduce((acc: number, v: any) => acc + v.rating, 0) / s.visits.length 
        : undefined,
      visitCount: s.visits ? s.visits.length : 0,
      lastVisitDate: s.visits && s.visits.length > 0 
        ? s.visits.sort((a: any, b: any) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())[0].visited_at
        : undefined,
      isOpenNow: false,
      created_at: s.created_at
    }));

    setSpots(mappedSpots);
  };

  // --- Actions ---

  const handleNavigate = (newScreen: AppScreen) => {
    setScreen(newScreen);
  };

  const handleUpdateSpot = async (updatedSpot: Partial<Spot> & { id: string }) => {
    // Optimistic update
    setSpots(prev => prev.map(spot => spot.id === updatedSpot.id ? { ...spot, ...updatedSpot } : spot));

    // DB Update
    const { id, ...fields } = updatedSpot;
    const dbFields: any = {};
    
    if (fields.name !== undefined) dbFields.name = fields.name;
    if (fields.status !== undefined) dbFields.status = fields.status;
    if (fields.scope !== undefined) dbFields.scope = fields.scope;
    if (fields.isPinned !== undefined) dbFields.is_pinned = fields.isPinned;
    if (fields.memo !== undefined) dbFields.memo = fields.memo;
    if (fields.address !== undefined) dbFields.address = fields.address;
    if (fields.phone !== undefined) dbFields.phone = fields.phone;
    if (fields.tags !== undefined) dbFields.tags = fields.tags;
    if (fields.openingHours !== undefined) dbFields.opening_hours = fields.openingHours;
    
    if (Object.keys(dbFields).length > 0) {
      await supabase.from('spots').update(dbFields).eq('id', id);
    }
  };

  const handleSaveSpot = async (spotData: Partial<Spot> & { id?: string }) => {
    if (!session) return;

    const spotPayload = {
      user_id: session.user.id,
      name: spotData.name,
      status: spotData.status || 'want_to_go',
      scope: spotData.scope || 'personal',
      cover_photo_url: spotData.photos?.[0]?.url || spotData.coverPhotoUrl,
      is_pinned: spotData.isPinned || false,
      tags: spotData.tags,
      memo: spotData.memo,
      url: spotData.url,
      phone: spotData.phone,
      address: spotData.address,
      price_min: spotData.priceMin,
      price_max: spotData.priceMax,
      opening_hours: spotData.openingHours,
    };

    let savedSpotId = spotData.id;

    if (spotData.id) {
      // Update
      const { error } = await supabase
        .from('spots')
        .update(spotPayload)
        .eq('id', spotData.id);
      if (error) console.error('Update failed', error);
    } else {
      // Insert
      const { data, error } = await supabase
        .from('spots')
        .insert([spotPayload])
        .select()
        .single();
      
      if (error) {
        console.error('Insert failed', error);
        return;
      }
      savedSpotId = data.id;
    }

    // Handle Photos (Insert new ones AND Delete removed ones)
    if (savedSpotId && spotData.photos) {
        // 1. Delete removed photos
        const { data: existingPhotos } = await supabase
            .from('photos')
            .select('id')
            .eq('spot_id', savedSpotId);
            
        if (existingPhotos) {
            const currentPhotoIds = spotData.photos.map(p => p.id);
            const photosToDelete = existingPhotos.filter(p => !currentPhotoIds.includes(p.id));
            
            if (photosToDelete.length > 0) {
                await supabase.from('photos').delete().in('id', photosToDelete.map(p => p.id));
            }
        }

        // 2. Insert new photos
        const newPhotos = spotData.photos.filter(p => p.id.startsWith('new-'));
        const photoInserts = newPhotos.map(p => ({
            spot_id: savedSpotId,
            url: p.url,
            user_id: session.user.id
        }));
        
        if (photoInserts.length > 0) {
            await supabase.from('photos').insert(photoInserts);
        }
    }

    if (session) fetchSpots(session.user.id, profile?.partner_id);
  };

  const handleTogglePin = async (spotId: string) => {
    const spot = spots.find(s => s.id === spotId);
    if (spot) {
      handleUpdateSpot({ id: spotId, isPinned: !spot.isPinned });
    }
  };

  const handleDeleteSpot = async (spotId: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    
    // Optimistic UI
    setSpots(prev => prev.filter(s => s.id !== spotId));
    
    // Cleanup photos first (if no cascade)
    await supabase.from('photos').delete().eq('spot_id', spotId);
    await supabase.from('visits').delete().eq('spot_id', spotId);
    await supabase.from('spots').delete().eq('id', spotId);
    
    handleNavigate({ view: 'home' });
  };

  const handleSaveVisit = async (spotId: string, visit: Visit) => {
    if (!session) return;

    const visitPayload = {
      spot_id: spotId,
      user_id: session.user.id,
      visited_at: visit.visitedAt,
      rating: visit.rating,
      memo: visit.memo,
      bill: visit.bill,
    };

    let visitId = visit.id;
    const isNew = visit.id.startsWith('new-');

    if (!isNew) {
      await supabase.from('visits').update(visitPayload).eq('id', visit.id);
    } else {
       const { data } = await supabase.from('visits').insert([visitPayload]).select().single();
       if (data) visitId = data.id;
    }

    // Handle Visit Photos
    if (visitId && visit.photos) {
         // 1. Delete removed photos
         const { data: existingPhotos } = await supabase
            .from('photos')
            .select('id')
            .eq('visit_id', visitId);

         if (existingPhotos) {
            const currentPhotoIds = visit.photos.map(p => p.id);
            const photosToDelete = existingPhotos.filter(p => !currentPhotoIds.includes(p.id));
            
            if (photosToDelete.length > 0) {
                await supabase.from('photos').delete().in('id', photosToDelete.map(p => p.id));
            }
         }

        // 2. Insert new photos
       const newPhotos = visit.photos.filter(p => p.id.startsWith('new-'));
       const photoInserts = newPhotos.map(p => ({
         visit_id: visitId,
         spot_id: spotId,
         url: p.url,
         user_id: session.user.id
       }));
       if (photoInserts.length > 0) {
         await supabase.from('photos').insert(photoInserts);
       }
    }

    // Update spot status to 'visited' automatically
    await supabase.from('spots').update({ status: 'visited' }).eq('id', spotId);

    if(session) fetchSpots(session.user.id, profile?.partner_id);
    setScreen({ view: 'spot-detail', spotId });
  };

  const handleDeleteVisit = async (spotId: string, visitId: string) => {
    // Cleanup photos first
    await supabase.from('photos').delete().eq('visit_id', visitId);
    await supabase.from('visits').delete().eq('id', visitId);
    if(session) fetchSpots(session.user.id, profile?.partner_id);
  };

  const handleApplyAiCompletion = (spotId: string, completionData: Partial<Spot>) => {
    const originalSpot = spots.find(s => s.id === spotId);
    if (originalSpot) {
      setPreviousSpotState(originalSpot);
    }
    handleUpdateSpot({ id: spotId, ...completionData });
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 10000);
    handleNavigate({ view: 'spot-form', spotId });
  };

  const handleUndo = () => {
    if (previousSpotState) {
      handleUpdateSpot({
          id: previousSpotState.id,
          name: previousSpotState.name,
          address: previousSpotState.address,
          phone: previousSpotState.phone,
          memo: previousSpotState.memo,
          tags: previousSpotState.tags,
          openingHours: previousSpotState.openingHours
      });
      setPreviousSpotState(null);
    }
    setShowUndo(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const activeTab = useMemo(() => {
    if (['home', 'favorites', 'shared', 'settings'].includes(screen.view)) {
      return screen.view as any;
    }
    return 'home';
  }, [screen]);

  // --- Render ---

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8 text-center">
        <div className="w-24 h-24 flex items-center justify-center bg-red-100 rounded-full mb-6">
            <Icon name="computer-desktop" className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">設定エラー</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
            Supabaseへの接続設定が見つかりません。<br/>
            lib/supabase.tsを確認してください。
        </p>
      </div>
    );
  }

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
            <div className="animate-spin h-10 w-10 border-4 border-neutral-200 border-t-[#FF5252] rounded-full"></div>
        </div>
      );
  }

  if (screen.view === 'welcome') {
    return <WelcomeScreen onNavigate={handleNavigate} />;
  }

  if (screen.view === 'login') {
    return <LoginScreen onLogin={() => {}} onNavigate={handleNavigate} />;
  }

  if (screen.view === 'signup') {
    return <SignUpScreen onSignUp={() => {}} onNavigate={handleNavigate} />;
  }
  
  if (!hasCompletedOnboarding && screen.view !== 'onboarding') {
       // Fallback if logic slips
       return <OnboardingScreen onComplete={() => { setHasCompletedOnboarding(true); setScreen({ view: 'home' }); }} />;
  }

  if (screen.view === 'onboarding') {
    return <OnboardingScreen onComplete={() => { setHasCompletedOnboarding(true); setScreen({ view: 'home' }); }} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-[#FF5252]/30">
      {isOffline && <OfflineBanner isOffline={isOffline} />}
      
      {/* Main Content Area */}
      <div className="pb-20"> {/* Padding for Bottom Nav */}
        {screen.view === 'home' && (
            <HomeScreen spots={spots} onNavigate={handleNavigate} view="home" userPlan={userPlan} />
        )}
        {screen.view === 'favorites' && (
            <HomeScreen spots={spots.filter(s => s.isPinned)} onNavigate={handleNavigate} view="favorites" userPlan={userPlan} />
        )}
        {screen.view === 'shared' && (
            <HomeScreen spots={spots.filter(s => s.scope !== 'personal')} onNavigate={handleNavigate} view="shared" userPlan={userPlan} />
        )}
        {screen.view === 'settings' && (
            <SettingsScreen 
                onBack={() => handleNavigate({ view: 'home' })} 
                onNavigate={handleNavigate} 
                userPlan={userPlan} 
                onLogout={handleLogout}
                theme={theme}
                onThemeChange={setTheme}
                tagSearchMode={tagSearchMode}
                onTagSearchModeChange={setTagSearchMode}
            />
        )}
      </div>

      {/* Modals & Overlays */}
      {screen.view === 'spot-detail' && (
        <SpotDetailModal 
            spot={spots.find(s => s.id === screen.spotId)!} 
            onClose={() => handleNavigate({ view: 'home' })} 
            onNavigate={handleNavigate}
            onUpdateSpot={handleUpdateSpot}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteSpot}
            onDeleteVisit={handleDeleteVisit}
        />
      )}
      
      {screen.view === 'spot-form' && (
        <SpotForm 
            spot={screen.spotId ? spots.find(s => s.id === screen.spotId) : undefined} 
            onClose={() => handleNavigate({ view: 'home' })} 
            onSave={handleSaveSpot}
            onNavigate={handleNavigate}
        />
      )}

      {screen.view === 'visit-form' && (
        <VisitFormModal 
            spot={spots.find(s => s.id === screen.spotId)!}
            visit={screen.visitId ? spots.find(s => s.id === screen.spotId)?.visits.find(v => v.id === screen.visitId) : undefined}
            onClose={() => handleNavigate({ view: 'spot-detail', spotId: screen.spotId })}
            onSave={handleSaveVisit}
        />
      )}

      {screen.view === 'ai-completion' && (
        <AiCompletionModal
            spot={spots.find(s => s.id === screen.spotId)!}
            completionData={screen.completionData}
            onClose={() => handleNavigate({ view: 'spot-form', spotId: screen.spotId })}
            onApply={handleApplyAiCompletion}
        />
      )}

      {screen.view === 'pairing' && (
          <PairingScreen 
            onBack={() => handleNavigate({ view: 'settings' })} 
            onPair={() => fetchProfileAndSpots(session!.user.id)}
            currentUser={profile}
          />
      )}

      <UndoToast isVisible={showUndo} onUndo={handleUndo} message="変更を元に戻せます" />

      {/* Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onNavigate={handleNavigate} 
        onAdd={() => handleNavigate({ view: 'spot-form' })} 
      />
    </div>
  );
};

export default App;
