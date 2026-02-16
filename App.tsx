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

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigation Handlers
  const goDashboard = () => setCurrentScreen(AppScreen.DASHBOARD);
  const goPermissions = () => setCurrentScreen(AppScreen.PERMISSIONS);
  const goKYC = () => setCurrentScreen(AppScreen.KYC);
  const goDisbursement = () => setCurrentScreen(AppScreen.DISBURSEMENT);
  const goRepayment = () => setCurrentScreen(AppScreen.REPAYMENT);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="w-full h-screen bg-white mesh-gradient overflow-hidden font-sans">
      {currentScreen === AppScreen.DASHBOARD && (
        <Dashboard
          onWithdraw={goPermissions}
          onNavigateRepayment={goRepayment}
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
