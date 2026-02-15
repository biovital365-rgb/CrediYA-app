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
    setLoading(false);
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
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-cy-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative bg-[#F8F9FA] overflow-hidden">

      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-cy-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[250px] h-[250px] bg-cy-accent/10 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24 relative z-10">

        {/* Header */}
        <header className="flex justify-between items-center py-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white p-0.5 rounded-full shadow-sm border border-gray-100">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} alt="User" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-cy-primary font-black uppercase tracking-widest">
                Nivel {profile?.current_level || 1}
              </p>
              <h1 className="text-xl font-bold text-cy-dark leading-none capitalize">Hola, {profile?.full_name || 'Amigo'} 👋</h1>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-soft border border-gray-50">
            <span className="material-symbols-outlined text-cy-dark text-xl">logout</span>
          </button>
        </header>

        {/* Level Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Tu Progreso Crediticio</span>
            <span className="text-xs font-bold text-cy-primary">Plata 🥈</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-gradient-primary w-[65%] rounded-full relative">
              <div className="absolute top-0 right-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
            </div>
          </div>
        </div>

        {!activeLoan ? (
          /* --- SIMULATOR --- */
          <section className="animate-in slide-in-from-bottom duration-500 fade-in">
            <Card className="bg-white border border-gray-100 shadow-xl relative mt-4 pt-8">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cy-dark text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-glow flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-cy-teal">verified</span>
                PRE-APROBADO
              </div>

              <div className="text-center mb-6">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wide">Monto a recibir</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl text-cy-primary font-bold">{TEXTS.CURRENCY}</span>
                  <span className="text-6xl font-extrabold text-cy-dark tracking-tighter">{requestAmount}</span>
                </div>
              </div>

              <div className="mb-8 px-2">
                <input
                  type="range"
                  min="200"
                  max={maxLimit}
                  step="100"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(Number(e.target.value))}
                  className="w-full h-4 bg-gray-100 rounded-full appearance-none cursor-pointer accent-cy-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase">
                  <span>Bs. 200</span>
                  <span>Bs. {maxLimit}</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 mb-6 font-medium">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                  <span className="text-sm text-gray-500">Plazo de pago</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setWeeks(Math.max(1, weeks - 1))} className="w-8 h-8 rounded-full bg-white shadow-sm text-cy-primary font-bold text-lg hover:bg-gray-50 transition-colors">-</button>
                    <span className="font-bold text-cy-dark w-16 text-center">{weeks} Semanas</span>
                    <button onClick={() => setWeeks(Math.min(12, weeks + 1))} className="w-8 h-8 rounded-full bg-cy-primary shadow-glow text-white font-bold text-lg hover:bg-cy-primary/90 transition-colors">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cuota Semanal</span>
                  <span className="text-xl font-extrabold text-cy-dark">Bs. {weeklyPayment}</span>
                </div>
              </div>

              <Button fullWidth onClick={handleApplyLoan} disabled={loading} className="shadow-lg shadow-cy-primary/20" icon="bolt">
                {loading ? 'Procesando...' : '¡Lo Quiero YA!'}
              </Button>
            </Card>
          </section>
        ) : (
          /* --- ACTIVE LOAN --- */
          <section className="animate-in slide-in-from-right duration-500 fade-in">
            <Card className="bg-gradient-dark text-white shadow-2xl relative overflow-hidden p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-cy-teal font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cy-teal animate-pulse"></span>
                      Crédito Activo
                    </p>
                    <h2 className="text-3xl font-extrabold">Bs. {activeLoan.amount + activeLoan.total_fee}</h2>
                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-tight">Deuda total con intereses</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center">
                    <p className="text-[10px] text-white/80 uppercase font-extrabold">PRÓXIMO</p>
                    <p className="text-lg font-bold text-white">
                      {nextPayment ? new Date(nextPayment.due_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : '---'}
                    </p>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Cuota Semanal</span>
                    <span className="font-bold text-white">Bs. {activeLoan.weekly_payment}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="w-[33%] h-full bg-cy-accent shadow-[0_0_10px_#F43F5E]"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={onNavigateRepayment}
                    className="bg-white text-cy-dark hover:bg-gray-100 border-0 h-11 text-sm font-bold"
                    icon="qr_code_2"
                  >
                    Pagar
                  </Button>
                  <Button
                    variant="tonal"
                    fullWidth
                    className="bg-white/10 text-white hover:bg-white/20 h-11 text-sm font-bold"
                  >
                    Detalles
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-6 left-5 right-5 z-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-2 shadow-2xl border border-white flex justify-between items-center">
          <button className="flex-1 flex flex-col items-center py-2 gap-1 text-cy-primary">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase">Inicio</span>
          </button>
          <div className="relative -top-8 px-4">
            <button className="w-16 h-16 rounded-full bg-cy-dark shadow-xl flex items-center justify-center text-white border-4 border-[#F8F9FA] active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-3xl text-cy-teal">qr_code_scanner</span>
            </button>
          </div>
          <button className="flex-1 flex flex-col items-center py-2 gap-1 text-gray-400">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-[10px] font-bold uppercase">Perfil</span>
          </button>
        </div>
      </div>

    </div>
  );
};