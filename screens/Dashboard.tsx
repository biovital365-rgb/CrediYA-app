import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface DashboardProps {
  onWithdraw: () => void;
  onNavigateRepayment: () => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onWithdraw, onNavigateRepayment, toggleTheme, isDark }) => {
  const [profile, setProfile] = useState<any>(null);
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [nextPayment, setNextPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Simulator State
  const maxLimit = profile?.credit_limit || 2500;
  const [requestAmount, setRequestAmount] = useState(1000);
  const [weeks, setWeeks] = useState(4);

  // Interest Logic
  const fee = Math.round(requestAmount * 0.025 * (weeks / 4));
  const weeklyPayment = Math.ceil((requestAmount + fee) / weeks);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        // 2. Fetch Active Loan
        const { data: loanData } = await supabase
          .from('loans')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['DISBURSED', 'APPROVED'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (loanData) {
          setActiveLoan(loanData);
          // 3. Fetch Next Payment
          const { data: paymentData } = await supabase
            .from('payments')
            .select('*')
            .eq('loan_id', loanData.id)
            .eq('status', 'PENDING')
            .order('due_date', { ascending: true })
            .limit(1)
            .maybeSingle();
          setNextPayment(paymentData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLoan = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No session found");

      const { error } = await supabase
        .from('loans')
        .insert([{
          user_id: user.id,
          amount: requestAmount,
          total_fee: fee,
          duration_weeks: weeks,
          weekly_payment: weeklyPayment,
          status: 'REQUESTED'
        }]);

      if (error) {
        if (error.code === '42501') {
          alert('Error de Seguridad (RLS): El usuario no tiene permiso para crear préstamos en Supabase. Por favor, revisa la configuración de políticas de la tabla "loans".');
        } else {
          alert('Error: ' + error.message);
        }
      } else {
        onWithdraw();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative mesh-gradient overflow-hidden">

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-28 relative z-10 transition-colors duration-500">

        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-white dark:bg-slate-800 p-0.5 rounded-2xl shadow-premium border border-white/60 dark:border-white/10">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'guest'}&backgroundColor=ffdfbf,ffd5dc,d1d4f9`}
                  alt="User"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cy-success border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                Hola, <span className="text-cy-primary">{profile?.full_name?.split(' ')[0] || 'Emprendedor'}</span> 👋
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                {currentUser?.email || 'verificando...'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-premium flex items-center justify-center border border-white/60 dark:border-white/10 hover:scale-105 transition-all text-slate-700 dark:text-amber-400"
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-premium flex items-center justify-center border border-white/60 dark:border-white/10 hover:text-red-500 transition-all text-slate-700 dark:text-slate-300"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Gamified Level Tracker */}
        <Card variant="filled" className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 mb-8 p-5 rounded-[28px]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cy-primary text-[20px]">military_tech</span>
              <span className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Estado VIP</span>
            </div>
            <div className="bg-cy-primary/10 dark:bg-cy-primary/20 px-3 py-1 rounded-full">
              <span className="text-[10px] font-black text-cy-primary uppercase tracking-tighter tracking-[0.1em]">Gamer Plata</span>
            </div>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-premium rounded-full shadow-glow transition-all duration-1000 ease-out"
              style={{ width: '65%' }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
            <span>Score: 650/1000</span>
            <span>Próximo: Oro</span>
          </div>
        </Card>

        {!activeLoan ? (
          /* --- SIMULATOR: ORANGE THEME --- */
          <section className="animate-in slide-in-from-bottom duration-700">
            <div className="premium-card relative p-8">

              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-premium text-white text-[11px] font-black px-6 py-2 rounded-full shadow-neon flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                CRÉDITO INMEDIATO
              </div>

              <div className="text-center mt-2 mb-10">
                <p className="text-slate-400 dark:text-slate-500 font-black text-[11px] uppercase tracking-widest mb-2">Solicitar Presupuesto</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl text-cy-primary font-black">Bs.</span>
                  <span className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter">{requestAmount}</span>
                </div>
              </div>

              {/* Refined Slider */}
              <div className="mb-12 px-2">
                <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-premium rounded-full"
                    style={{ width: `${((requestAmount - 200) / (maxLimit - 200)) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min="200"
                    max={maxLimit}
                    step="100"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(Number(e.target.value))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div
                    className="absolute top-1/2 -mt-4 w-8 h-8 bg-white dark:bg-slate-700 border-[4px] border-cy-primary rounded-full shadow-xl pointer-events-none transition-all z-10"
                    style={{ left: `calc(${((requestAmount - 200) / (maxLimit - 200)) * 100}% - 16px)` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                  <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Bs. 200</span>
                  <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Límite: Bs. {maxLimit}</span>
                </div>
              </div>

              {/* Terms Selector */}
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-[28px] p-6 mb-10 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-6">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Frecuencia</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">Pagos Semanales</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-2 py-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setWeeks(Math.max(1, weeks - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-cy-primary font-black text-xl hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="font-black text-slate-800 dark:text-white w-8 text-center text-lg">{weeks}</span>
                    <button
                      onClick={() => setWeeks(Math.min(12, weeks + 1))}
                      className="w-10 h-10 rounded-xl bg-cy-primary text-white font-black text-xl hover:shadow-glow"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cuota Estimada</span>
                  <span className="text-2xl font-black text-cy-success">Bs. {weeklyPayment}</span>
                </div>
              </div>

              <div className="px-1">
                <Button
                  fullWidth
                  onClick={handleApplyLoan}
                  disabled={loading}
                  className="h-16 text-lg shadow-neon bg-cy-dark dark:bg-cy-primary dark:text-white"
                  icon="rocket_launch"
                >
                  {loading ? 'Preparando...' : 'SOLICITAR AHORA'}
                </Button>
                <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                  <span className="material-symbols-outlined text-[16px] text-cy-success">verified</span>
                  Verificación Instantánea
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* --- ACTIVE LOAN: GREEN THEME --- */
          <section className="animate-in slide-in-from-right duration-700">
            <div className="premium-card bg-slate-900 border-none p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cy-success/10 rounded-full blur-[40px]"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-cy-success animate-pulse"></div>
                      <p className="text-cy-success font-black text-[10px] uppercase tracking-[0.2em]">Crédito Vigente</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white/40 text-xl font-bold">Bs.</span>
                      <h2 className="text-6xl font-black tracking-tighter">{activeLoan.amount + activeLoan.total_fee}</h2>
                    </div>
                    <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mt-2">Saldo a Repagar</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[85px]">
                    <p className="text-[9px] text-white/50 uppercase font-black tracking-widest mb-1">Próximo</p>
                    <p className="text-lg font-black text-cy-primary leading-none">
                      {nextPayment ? new Date(nextPayment.due_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : '---'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 mb-10 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/40 text-[11px] font-black uppercase tracking-widest">Pago Semanal</span>
                    <span className="font-black text-cy-success text-xl">Bs. {activeLoan.weekly_payment}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-success shadow-neon-success transition-all duration-1000"
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={onNavigateRepayment}
                    className="bg-white text-slate-900 border-0 h-15 font-black text-xs uppercase tracking-widest"
                    icon="qr_code_scanner"
                  >
                    Pagar Cuota
                  </Button>
                  <Button
                    variant="tonal"
                    fullWidth
                    className="bg-white/10 text-white border border-white/10 h-15 font-black text-xs uppercase tracking-widest"
                    icon="history"
                  >
                    Historial
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Feature Highlights Group */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Card className="bg-white dark:bg-slate-900/40 p-5 rounded-[28px] border-none shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-cy-primary/10 rounded-full flex items-center justify-center text-cy-primary mb-3">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <p className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-tighter">Legal & Seguro</p>
            <p className="text-[9px] text-slate-400 font-bold leading-tight mt-1 uppercase">Bajo normativa ASFI</p>
          </Card>
          <Card className="bg-white dark:bg-slate-900/40 p-5 rounded-[28px] border-none shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-cy-success/10 rounded-full flex items-center justify-center text-cy-success mb-3">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <p className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-tighter">Desembolso</p>
            <p className="text-[9px] text-slate-400 font-bold leading-tight mt-1 uppercase">Directo por QR</p>
          </Card>
        </div>

      </div>

      {/* Modern Bottom Nav */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="bg-slate-900/95 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[32px] p-2 flex justify-between items-center shadow-2xl border border-white/10">
          <button className="flex-1 flex flex-col items-center py-3 gap-1 text-cy-primary group">
            <span className="material-symbols-outlined text-[26px]">grid_view</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Inicio</span>
          </button>

          <div className="relative -top-10">
            <button
              onClick={onNavigateRepayment}
              className="w-20 h-20 rounded-full bg-gradient-premium shadow-neon flex items-center justify-center text-white border-[6px] border-slate-50 dark:border-slate-950 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-4xl">qr_code_2</span>
            </button>
          </div>

          <button className="flex-1 flex flex-col items-center py-3 gap-1 text-slate-500 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[26px]">account_circle</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
          </button>
        </div>
      </div>

    </div>
  );
};