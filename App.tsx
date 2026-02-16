import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './screens/Dashboard';
import { Permissions } from './screens/Permissions';
import { KYC } from './screens/KYC';
import { Disbursement } from './screens/Disbursement';
import { Repayment } from './screens/Repayment';
import { Login } from './screens/Login';
import { AppScreen } from './types';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Safety timeout for mobile devices - reduce to 3 seconds for faster fallback
    const timeout = setTimeout(() => {
      console.warn("Safety timeout: forcing loading to false");
      setLoading(false);
    }, 3000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  // Navigation Handlers
  const goDashboard = () => setCurrentScreen(AppScreen.DASHBOARD);
  const goPermissions = () => setCurrentScreen(AppScreen.PERMISSIONS);
  const goKYC = () => setCurrentScreen(AppScreen.KYC);
  const goDisbursement = () => setCurrentScreen(AppScreen.DISBURSEMENT);
  const goRepayment = () => setCurrentScreen(AppScreen.REPAYMENT);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="w-16 h-16 border-[4px] border-cy-primary/10 border-t-cy-primary rounded-full animate-spin shadow-glow mb-6"></div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Credi<span className="text-cy-primary">YA</span></h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] animate-pulse">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="w-full h-screen bg-slate-50 dark:bg-slate-950 mesh-gradient overflow-hidden font-sans transition-colors duration-500">
      {currentScreen === AppScreen.DASHBOARD && (
        <Dashboard
          onWithdraw={goPermissions}
          onNavigateRepayment={goRepayment}
          toggleTheme={toggleTheme}
          isDark={isDark}
        />
      )}

      {currentScreen === AppScreen.PERMISSIONS && (
        <Permissions
          onContinue={goKYC}
          onBack={goDashboard}
        />
      )}

      {currentScreen === AppScreen.KYC && (
        <KYC
          onComplete={goDisbursement}
          onBack={goPermissions}
        />
      )}

      {currentScreen === AppScreen.DISBURSEMENT && (
        <Disbursement
          onFinish={goDashboard}
        />
      )}

      {currentScreen === AppScreen.REPAYMENT && (
        <Repayment
          onBack={goDashboard}
        />
      )}
    </div>
  );
};

export default App;
