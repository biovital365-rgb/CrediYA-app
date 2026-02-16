import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface RepaymentProps {
    onBack: () => void;
}

export const Repayment: React.FC<RepaymentProps> = ({ onBack }) => {
    const [loan, setLoan] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoanData();
    }, []);

    const fetchLoanData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: loanData } = await supabase
                .from('loans')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['DISBURSED', 'APPROVED'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (loanData) {
                setLoan(loanData);
                const { data: instData } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('loan_id', loanData.id)
                    .order('due_date', { ascending: true });
                setInstallments(instData || []);
            }
        }
        setLoading(false);
    };

    if (loading) return null;

    const nextPayment = installments.find(inst => inst.status === 'PENDING');

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto mesh-gradient relative overflow-hidden">

            <header className="bg-slate-900 dark:bg-black p-8 pt-12 pb-24 rounded-b-[60px] text-white relative shadow-2xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cy-primary/10 rounded-full blur-[80px]"></div>

                <div className="flex justify-between items-center mb-10 relative z-10">
                    <button onClick={onBack} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white/80">Mi Plan de Pago</h1>
                    <div className="w-12"></div>
                </div>

                <div className="text-center relative z-10">
                    <p className="text-cy-primary font-black text-xs uppercase tracking-widest mb-3">Próximo Vencimiento</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-2xl font-bold opacity-40">Bs.</span>
                        <h2 className="text-7xl font-black tracking-tighter">
                            {nextPayment?.amount || loan?.weekly_payment || '0'}
                        </h2>
                    </div>
                    <p className="text-white/40 font-bold text-[11px] uppercase tracking-widest">
                        {nextPayment ? new Date(nextPayment.due_date).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Todo pagado ✨'}
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 -mt-12 relative z-20">

                {nextPayment && (
                    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-none shadow-premium mb-8 text-center py-12 px-8 rounded-[40px] animate-in zoom-in duration-500">
                        <div className="w-48 h-48 mx-auto bg-white dark:bg-white p-3 rounded-[32px] mb-8 shadow-xl relative group">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY_LOAN_${loan?.id}_${nextPayment.id}&color=0f172a`}
                                alt="QR Pago"
                                className="w-full h-full mix-blend-multiply opacity-90 transition-transform group-hover:scale-95"
                            />
                            <div className="absolute inset-0 border-[10px] border-slate-50 dark:border-white rounded-[32px]"></div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Pago QR Simple</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight leading-relaxed px-4">
                            Escanea este código desde tu banca móvil para pagar tu cuota semanal de forma inmediata.
                        </p>
                    </Card>
                )}

                <div className="space-y-4 mb-10">
                    <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 px-2">Calendario de Cuotas</h4>
                    {installments.map((installment, idx) => (
                        <div
                            key={installment.id}
                            className={`flex items-center justify-between p-6 bg-white dark:bg-slate-900/50 rounded-[30px] border border-white dark:border-slate-800 shadow-premium transition-all duration-300 ${installment.status === 'PAID' ? 'opacity-40 grayscale opacity-40' : 'hover:border-cy-primary/30'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${installment.status === 'PAID' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-cy-primary/10 text-cy-primary'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">Cuota Semanal</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                        {new Date(installment.due_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Bs. {installment.amount}</p>
                                {installment.status === 'PAID' && (
                                    <span className="text-[9px] font-black text-cy-success uppercase tracking-widest">Pagado ✓</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    fullWidth
                    variant="tonal"
                    onClick={onBack}
                    className="h-14 font-black text-xs uppercase tracking-widest text-slate-400 mb-10"
                    icon="keyboard_return"
                >
                    Volver al Dashboard
                </Button>
            </div>
        </div>
    );
};