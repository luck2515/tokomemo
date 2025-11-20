
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
import UpdatePasswordScreen from './screens/UpdatePasswordScreen';
import Header from './components/Header';
import { AppScreen, Spot, Visit, UserProfile } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Icon, PLAN_LIMITS } from './constants';

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

  // Auth & Onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // --- Initialization & Auth ---

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check for payment callbacks (Simulating Stripe Return)
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    const paymentCanceled = params.get('payment_canceled');
    const newPlan = params.get('plan');

    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // If coming back from payment success
        if (paymentSuccess && newPlan) {
             localStorage.setItem(`plan_subscription_${session.user.id}`, newPlan);
             window.history.replaceState({}, '', '/');
             alert('プランの変更が完了しました！ありがとうございます。');
        }
        // If coming back from payment cancel
        else if (paymentCanceled) {
            window.history.replaceState({}, '', '/');
            alert('決済手続きがキャンセルされました。');
        }

        fetchProfileAndSpots(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setScreen({ view: 'update-password' });
        setLoading(false);
        return;
      }

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
            
            // Determine Plan (Simulating DB subscription status via LocalStorage)
            const subscription = localStorage.getItem(`plan_subscription_${userId}`);
            
            if (subscription === 'couple') {
                setUserPlan('couple');
            } else if (subscription === 'supporter') {
                setUserPlan('supporter');
            } else {
                setUserPlan('free');
            }
            
            // 2. Fetch Spots (Depend on profile for partner logic)
            await fetchSpots(userId, profileData.partner_id);
            setHasCompletedOnboarding(true); 
            if (screen.view !== 'update-password') {
                setScreen({ view: 'home' });
            }
        } else {
             setHasCompletedOnboarding(true);
             if (screen.view !== 'update-password') {
                 setScreen({ view: 'home' });
             }
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
        spot_id: s.id,
        user_id: v.user_id
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

  // --- Usage Logic ---
  const usageStats = useMemo(() => {
    if (!session) return { photos: 0, ai: 0 };
    
    // Count photos owned by current user
    let photoCount = 0;
    spots.forEach(spot => {
        spot.photos.forEach(p => {
            if (spot.user_id === session.user.id) photoCount++; 
        });
        spot.visits.forEach(v => {
             if (v.user_id === session.user.id) {
                 photoCount += v.photos.length;
             }
        });
    });

    // AI Usage from LocalStorage (Monthly)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const aiKey = `ai_usage_${session.user.id}_${currentMonth}`;
    const aiCount = parseInt(localStorage.getItem(aiKey) || '0');

    return { photos: photoCount, ai: aiCount };
  }, [spots, session]);

  const checkStorageLimit = (additional: number = 1) => {
      const limit = PLAN_LIMITS[userPlan].photos;
      if (limit === Infinity) return true;
      if (usageStats.photos + additional > limit) {
          alert(`写真の保存容量がいっぱいです。\n現在のプランの上限は${limit}枚です。`);
          return false;
      }
      return true;
  };

  const checkAiLimit = () => {
      const limit = PLAN_LIMITS[userPlan].ai_month;
      if (usageStats.ai >= limit) {
          alert(`今月のAI利用回数制限に達しました。\n上限は${limit}回です。`);
          return false;
      }
      return true;
  };

  const incrementAiUsage = () => {
      if (!session) return;
      const currentMonth = new Date().toISOString().slice(0, 7);
      const aiKey = `ai_usage_${session.user.id}_${currentMonth}`;
      const newCount = usageStats.ai + 1;
      localStorage.setItem(aiKey, newCount.toString());
  };

  // --- Actions ---

  const handleNavigate = (newScreen: AppScreen) => {
    setScreen(newScreen);
  };

  const handleUpdateSpot = async (updatedSpot: Partial<Spot> & { id: string }) => {
    setSpots(prev => prev.map(spot => spot.id === updatedSpot.id ? { ...spot, ...updatedSpot } : spot));
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
    if (fields.priceMin !== undefined) dbFields.price_min = fields.priceMin;
    if (fields.priceMax !== undefined) dbFields.price_max = fields.priceMax;
    if (fields.paymentMethods !== undefined) dbFields.payment_methods = fields.paymentMethods;
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
      payment_methods: spotData.paymentMethods,
    };
    let savedSpotId = spotData.id;
    if (spotData.id) {
      const { error } = await supabase.from('spots').update(spotPayload).eq('id', spotData.id);
      if (error) console.error('Update failed', error);
    } else {
      const { data, error } = await supabase.from('spots').insert([spotPayload]).select().single();
      if (error) { console.error('Insert failed', error); return; }
      savedSpotId = data.id;
    }
    if (savedSpotId && spotData.photos) {
        const { data: existingPhotos } = await supabase.from('photos').select('id').eq('spot_id', savedSpotId);
        if (existingPhotos) {
            const currentPhotoIds = spotData.photos.map(p => p.id);
            const photosToDelete = existingPhotos.filter(p => !currentPhotoIds.includes(p.id));
            if (photosToDelete.length > 0) await supabase.from('photos').delete().in('id', photosToDelete.map(p => p.id));
        }
        const newPhotos = spotData.photos.filter(p => p.id.startsWith('new-'));
        const photoInserts = newPhotos.map(p => ({ spot_id: savedSpotId, url: p.url, user_id: session.user.id }));
        if (photoInserts.length > 0) await supabase.from('photos').insert(photoInserts);
    }
    if (session) fetchSpots(session.user.id, profile?.partner_id);
  };

  const handleTogglePin = async (spotId: string) => {
    const spot = spots.find(s => s.id === spotId);
    if (spot) handleUpdateSpot({ id: spotId, isPinned: !spot.isPinned });
  };

  const handleDeleteSpot = async (spotId: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    setSpots(prev => prev.filter(s => s.id !== spotId));
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
    if (visitId && visit.photos) {
         const { data: existingPhotos } = await supabase.from('photos').select('id').eq('visit_id', visitId);
         if (existingPhotos) {
            const currentPhotoIds = visit.photos.map(p => p.id);
            const photosToDelete = existingPhotos.filter(p => !currentPhotoIds.includes(p.id));
            if (photosToDelete.length > 0) await supabase.from('photos').delete().in('id', photosToDelete.map(p => p.id));
         }
       const newPhotos = visit.photos.filter(p => p.id.startsWith('new-'));
       const photoInserts = newPhotos.map(p => ({ visit_id: visitId, spot_id: spotId, url: p.url, user_id: session.user.id }));
       if (photoInserts.length > 0) await supabase.from('photos').insert(photoInserts);
    }
    await supabase.from('spots').update({ status: 'visited' }).eq('id', spotId);
    if(session) fetchSpots(session.user.id, profile?.partner_id);
    setScreen({ view: 'spot-detail', spotId });
  };

  const handleDeleteVisit = async (spotId: string, visitId: string) => {
    await supabase.from('photos').delete().eq('visit_id', visitId);
    await supabase.from('visits').delete().eq('id', visitId);
    if(session) fetchSpots(session.user.id, profile?.partner_id);
  };

  const handleApplyAiCompletion = (spotId: string, completionData: Partial<Spot>) => {
    const originalSpot = spots.find(s => s.id === spotId);
    if (originalSpot) setPreviousSpotState(originalSpot);
    handleUpdateSpot({ id: spotId, ...completionData });
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 10000);
    handleNavigate({ view: 'spot-form', spotId });
    incrementAiUsage(); 
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
          openingHours: previousSpotState.openingHours,
          priceMin: previousSpotState.priceMin,
          priceMax: previousSpotState.priceMax,
          paymentMethods: previousSpotState.paymentMethods
      });
      setPreviousSpotState(null);
    }
    setShowUndo(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
      if (!session) return;
      if (window.confirm("本当にアカウントを削除しますか？\nこの操作は取り消せません。全てのデータ（スポット、写真、訪問記録）が削除されます。")) {
          try {
              // Try to delete profile. This requires RLS policy or cascading delete.
              const { error } = await supabase.from('profiles').delete().eq('id', session.user.id);
              
              if (error) {
                 console.error("Delete profile error:", error);
                 // Fallback or specific handling
                 throw new Error("プロフィールの削除に失敗しました。データベースの削除ポリシーを確認してください。");
              }
              
              await supabase.auth.signOut();
              alert("退会処理が完了しました。ご利用ありがとうございました。");
              setScreen({ view: 'welcome' });
          } catch (e: any) {
              console.error(e);
              alert("退会処理に失敗しました: " + e.message);
              // Re-throw to let the component know to stop spinning
              throw e;
          }
      }
  };

  const handleChangePlan = (plan: 'free' | 'supporter') => {
    if (!session) return;
    if (plan === 'free') {
        localStorage.removeItem(`plan_subscription_${session.user.id}`);
        setUserPlan('free');
        alert('フリープランに変更しました。');
    }
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
        <div className="w-24 h-24 flex items-center justify-center bg-rose-100 rounded-full mb-6 animate-pulse">
            <Icon name="computer-desktop" className="w-12 h-12 text-rose-500" />
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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF5252] to-[#ff8a80] animate-spin flex items-center justify-center shadow-xl shadow-rose-500/30">
                  <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900 rounded-full"></div>
              </div>
              <p className="mt-4 font-bold text-neutral-400 text-sm tracking-widest">LOADING</p>
            </div>
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
  
  if (screen.view === 'update-password') {
    return <UpdatePasswordScreen onNavigate={handleNavigate} />;
  }
  
  if (!hasCompletedOnboarding && screen.view !== 'onboarding') {
       return <OnboardingScreen onComplete={() => { setHasCompletedOnboarding(true); setScreen({ view: 'home' }); }} />;
  }

  if (screen.view === 'onboarding') {
    return <OnboardingScreen onComplete={() => { setHasCompletedOnboarding(true); setScreen({ view: 'home' }); }} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-rose-500/30">
      {isOffline && <OfflineBanner isOffline={isOffline} />}

      {['home', 'favorites', 'shared'].includes(screen.view) && <Header />}
      
      {/* Increased padding bottom for floating nav */}
      <div className="pb-32 pt-14"> 
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
                onDeleteAccount={handleDeleteAccount}
                usageStats={usageStats}
                onChangePlan={handleChangePlan}
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
            checkStorageLimit={checkStorageLimit}
            checkAiLimit={checkAiLimit}
            incrementAiUsage={incrementAiUsage}
        />
      )}

      {screen.view === 'visit-form' && (
        <VisitFormModal 
            spot={spots.find(s => s.id === screen.spotId)!}
            visit={screen.visitId ? spots.find(s => s.id === screen.spotId)?.visits.find(v => v.id === screen.visitId) : undefined}
            onClose={() => handleNavigate({ view: 'spot-detail', spotId: screen.spotId })}
            onSave={handleSaveVisit}
            checkStorageLimit={checkStorageLimit}
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

      <BottomNavigation 
        activeTab={activeTab} 
        onNavigate={handleNavigate} 
        onAdd={() => handleNavigate({ view: 'spot-form' })} 
      />
    </div>
  );
};

export default App;
