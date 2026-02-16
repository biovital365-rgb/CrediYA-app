import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TEXTS } from '../constants';

interface DashboardProps {
  onWithdraw: () => void;
  onNavigateRepayment: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onWithdraw, onNavigateRepayment }) => {
  const [profile, setProfile] = useState<any>(null);
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [nextPayment, setNextPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);
        else {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ id: user.id, full_name: user.email?.split('@')[0] }])
            .select()
            .single();
          setProfile(newProfile);
        }

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
        } else {
          setActiveLoan(null);
          setNextPayment(null);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: loan, error } = await supabase
        .from('loans')
        .insert([{
          user_id: user.id,
          amount: requestAmount,
          total_fee: fee,
          duration_weeks: weeks,
          weekly_payment: weeklyPayment,
          status: 'REQUESTED'
        }])
        .select()
        .single();

      if (error) alert('Error: ' + error.message);
      else onWithdraw();
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative mesh-gradient overflow-hidden">

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-28 relative z-10">

        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-white p-0.5 rounded-2xl shadow-premium border border-white/60">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt="User"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cy-teal border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="text-[10px] text-cy-primary font-extrabold uppercase tracking-widest mb-0.5">
                Nivel {profile?.current_level || 1} • Gamer
              </p>
              <h1 className="text-2xl font-black text-cy-dark leading-tight flex items-center gap-1">
                Hola, <span className="capitalize">{profile?.full_name?.split(' ')[0] || 'Emprendedor'}</span> 👋
              </h1>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-11 h-11 rounded-2xl bg-white shadow-premium flex items-center justify-center border border-white/60 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-cy-dark text-[22px]">logout</span>
          </button>
        </header>

        {/* Gamified Level Tracker */}
        <Card variant="filled" className="bg-white/40 backdrop-blur-md border border-white/60 mb-8 p-4">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cy-primary text-[18px]">verified_user</span>
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">Tu Score Crediticio</span>
            </div>
            <div className="bg-cy-primary/10 px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-black text-cy-primary uppercase">Plata 🥈</span>
            </div>
          </div>
          <div className="h-3 bg-gray-200/50 rounded-full overflow-hidden p-[1px] mb-2">
            <div
              className="h-full bg-gradient-primary rounded-full relative transition-all duration-1000 ease-out shadow-glow"
              style={{ width: '65%' }}
            >
              <div className="absolute top-0 right-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:20px_20px] animate-[pulse_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 text-center">
            A 1 pago de subir a <span className="text-cy-dark">Nivel Oro 🥇</span>
          </p>
        </Card>

        {!activeLoan ? (
          /* --- SIMULATOR: THE WOW CARD --- */
          <section className="animate-in slide-in-from-bottom duration-700 fade-in">
            <Card className="bg-white border-none shadow-premium relative mt-6 pt-10 pb-8 overflow-visible">

              {/* Floating Badge (Fixed Cutoff) */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cy-dark text-white text-[11px] font-black px-5 py-2 rounded-full shadow-neon flex items-center gap-1.5 z-20">
                <span className="material-symbols-outlined text-[16px] text-cy-teal">bolt</span>
                DINERO AL INSTANTE
              </div>

              <div className="text-center mb-8">
                <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mb-2">¿Cuánto presupuesto necesitas?</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl text-cy-primary font-black">Bs.</span>
                  <span className="text-7xl font-extrabold text-cy-dark tracking-tighter tabular-nums">{requestAmount}</span>
                </div>
              </div>

              {/* Refined Slider */}
              <div className="mb-10 px-4">
                <div className="relative h-2 bg-gray-100 rounded-full mb-6">
                  <div
                    className="absolute top-0 left-0 h-full bg-cy-primary rounded-full shadow-glow"
                    style={{ width: `${((requestAmount - 200) / (maxLimit - 200)) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min="200"
                    max={maxLimit}
                    step="100"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(Number(e.target.value))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="absolute top-1/2 -mt-3.5 w-7 h-7 bg-white border-[3px] border-cy-primary rounded-full shadow-lg pointer-events-none transition-all"
                    style={{ left: `calc(${((requestAmount - 200) / (maxLimit - 200)) * 100}% - 14px)` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 font-black uppercase">
                  <span className="bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">Bs. 200</span>
                  <span className="bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">Bs. {maxLimit}</span>
                </div>
              </div>

              {/* Terms Selector */}
              <div className="bg-[#F1F5F9]/50 rounded-[28px] p-5 border border-gray-100/50 mb-8 mx-2">
                <div className="flex justify-between items-center mb-5 border-b border-gray-200/50 pb-5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wide">Plazo de retorno</span>
                    <span className="text-sm font-bold text-cy-dark">Frecuencia Semanal</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button
                      onClick={() => setWeeks(Math.max(1, weeks - 1))}
                      className="w-10 h-10 rounded-xl bg-gray-50 text-cy-primary font-black text-xl hover:bg-gray-100 active:scale-90 transition-all"
                    >
                      -
                    </button>
                    <span className="font-black text-cy-dark w-12 text-center text-lg">{weeks}</span>
                    <button
                      onClick={() => setWeeks(Math.min(12, weeks + 1))}
                      className="w-10 h-10 rounded-xl bg-cy-primary text-white font-black text-xl hover:bg-cy-primary/90 active:scale-90 transition-all shadow-soft"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-gray-500">Pago por semana</span>
                  <span className="text-2xl font-black text-cy-dark">Bs. {weeklyPayment}</span>
                </div>
              </div>

              <div className="px-2">
                <Button
                  fullWidth
                  onClick={handleApplyLoan}
                  disabled={loading}
                  className="shadow-neon h-14 md:h-16 text-lg tracking-tight bg-cy-dark"
                  icon="rocket_launch"
                >
                  {loading ? 'Procesando...' : '¡SOLICITAR DINERO!'}
                </Button>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  <span className="material-symbols-outlined text-[14px] text-cy-teal">verified</span>
                  Aprobación en 60 segundos
                </p>
              </div>
            </Card>
          </section>
        ) : (
          /* --- ACTIVE LOAN: DARK PREMIUM CARD --- */
          <section className="animate-in slide-in-from-right duration-700 fade-in">
            <Card className="bg-gradient-dark text-white border-none shadow-2xl relative overflow-hidden p-8">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cy-primary/10 rounded-full blur-[60px] transform translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cy-accent/10 rounded-full blur-[40px] transform -translate-x-10 translate-y-10"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-cy-teal animate-pulse"></span>
                      <p className="text-cy-teal font-black text-[10px] uppercase tracking-[0.2em]">Suscripción Activa</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white/50 text-xl font-bold">Bs.</span>
                      <h2 className="text-5xl font-black tracking-tighter">{activeLoan.amount + activeLoan.total_fee}</h2>
                    </div>
                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-1">Saldo pendiente</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[80px]">
                    <p className="text-[9px] text-white/60 uppercase font-black tracking-widest mb-1">Próximo</p>
                    <p className="text-xl font-black text-white leading-none">
                      {nextPayment ? new Date(nextPayment.due_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : '---'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 mb-8 backdrop-blur-sm border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/60 text-xs font-bold font-sans">Cuota Semanal</span>
                    <span className="font-black text-white text-lg">Bs. {activeLoan.weekly_payment}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cy-teal to-cy-primary shadow-[0_0_15px_rgba(45,212,191,0.5)] transition-all duration-1000"
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={onNavigateRepayment}
                    className="bg-white text-cy-dark hover:bg-gray-100 border-0 h-14 font-black text-sm uppercase tracking-widest"
                    icon="qr_code_scanner"
                  >
                    Pagar
                  </Button>
                  <Button
                    variant="tonal"
                    fullWidth
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/10 h-14 font-black text-sm uppercase tracking-widest"
                    icon="info"
                  >
                    Ver Mas
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Feature Highlights Group */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-cy-teal/10 rounded-full flex items-center justify-center text-cy-teal mb-3">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <p className="text-[11px] font-black text-cy-dark uppercase tracking-tight">Seguro 100%</p>
            <p className="text-[9px] text-gray-500 font-bold leading-tight mt-1">Cifrado de grado bancario (ASFI)</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-cy-accent/10 rounded-full flex items-center justify-center text-cy-accent mb-3">
              <span className="material-symbols-outlined text-[20px]">flash_on</span>
            </div>
            <p className="text-[11px] font-black text-cy-dark uppercase tracking-tight">Carga Flash</p>
            <p className="text-[9px] text-gray-500 font-bold leading-tight mt-1">Recibe tu dinero en menos de 5 min</p>
          </div>
        </div>

      </div>

      {/* Premium Bottom Nav Bar */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="bg-cy-dark/95 backdrop-blur-2xl rounded-[32px] p-2.5 shadow-2xl border border-white/10 flex justify-between items-center">

          <button className="flex-1 flex flex-col items-center py-2.5 gap-1.5 text-cy-teal transition-all group">
            <span className="material-symbols-outlined text-[26px]">home</span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-80">Inicio</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cy-teal shadow-[0_0_8px_rgba(45,212,191,0.8)]"></div>
          </button>

          {/* Central Scanner Button */}
          <div className="relative -top-10">
            <div className="w-20 h-20 rounded-full bg-[#1e293b] p-2 shadow-2xl border-[6px] border-[#f8fafc]">
              <button
                className="w-full h-full rounded-full bg-gradient-primary shadow-glow flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
              </button>
            </div>
          </div>

          <button className="flex-1 flex flex-col items-center py-2.5 gap-1.5 text-white/40 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[26px]">person_outline</span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-80">Perfil</span>
            <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
          </button>
        </div>
      </div>

    </div>
  );
};