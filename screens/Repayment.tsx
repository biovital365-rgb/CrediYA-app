import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TEXTS } from '../constants';

interface RepaymentProps {
    onBack: () => void;
}

export const Repayment: React.FC<RepaymentProps> = ({ onBack }) => {
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        fetchLoanAndPayments();
    }, []);

    const fetchLoanAndPayments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: loan } = await supabase
                .from('loans')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['DISBURSED', 'APPROVED'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (loan) {
                setActiveLoan(loan);

                const { data: payments } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('loan_id', loan.id)
                    .order('due_date', { ascending: true });

                if (payments && payments.length > 0) {
                    setInstallments(payments);
                } else {
                    const newPayments = [];
                    for (let i = 1; i <= loan.duration_weeks; i++) {
                        const dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + (i * 7));
                        newPayments.push({
                            loan_id: loan.id,
                            amount: loan.weekly_payment,
                            due_date: dueDate.toISOString(),
                            status: 'PENDING'
                        });
                    }
                    const { data: createdPayments } = await supabase
                        .from('payments')
                        .insert(newPayments)
                        .select();

                    if (createdPayments) setInstallments(createdPayments);
                }
            }
        }
        setLoading(false);
    };

    const handleSimulatePayment = async (paymentId: string) => {
        setIsPaying(true);
        const { error } = await supabase
            .from('payments')
            .update({ status: 'PAID', paid_at: new Date().toISOString() })
            .eq('id', paymentId);

        if (error) {
            alert('Error al procesar pago: ' + error.message);
        } else {
            await fetchLoanAndPayments();
        }
        setIsPaying(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!activeLoan) return null;

    const nextPayment = installments.find(p => p.status === 'PENDING');

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto mesh-gradient overflow-hidden">

            {/* Header: Dark Premium */}
            <header className="bg-cy-dark p-6 pt-8 pb-14 rounded-b-[48px] text-white relative shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cy-primary/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 hover:bg-white/20 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black uppercase tracking-widest text-white/90">Mi Plan de Pagos</h1>
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="bg-cy-primary/20 text-cy-teal text-[10px] font-black px-4 py-1.5 rounded-full border border-cy-teal/20 mb-3 tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cy-teal rounded-full animate-pulse shadow-glow"></span>
                        CUOTA PRÓXIMA
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl text-white/50 font-black tracking-tight">Bs.</span>
                        <h2 className="text-6xl font-black tracking-tighter tabular-nums">
                            {nextPayment ? nextPayment.amount : '0'}
                        </h2>
                    </div>
                    {nextPayment && (
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            Vence: <span className="text-white">
                                {new Date(nextPayment.due_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })}
                            </span>
                        </p>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar -mt-8 px-6 pb-24 relative z-20">

                {/* Simulated QR: WOW Card */}
                {nextPayment && (
                    <Card className="bg-white/80 backdrop-blur-xl border-none shadow-premium mb-8 text-center py-10 px-6">
                        <div className="flex flex-col items-center">
                            <h3 className="text-cy-dark font-black text-xl mb-6 tracking-tight">Paga rápido con QR</h3>

                            <div
                                onClick={() => handleSimulatePayment(nextPayment.id)}
                                className="w-64 h-64 bg-white border-none rounded-[40px] p-6 flex items-center justify-center relative mb-6 cursor-pointer shadow-premium hover:shadow-neon group transition-all"
                            >
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAGO_CUOTA_${nextPayment.id}`}
                                    alt="QR Pago"
                                    className="w-full h-full opacity-100 group-hover:scale-105 transition-transform"
                                />
                                {isPaying && (
                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-[40px] backdrop-blur-md">
                                        <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[11px] text-gray-400 font-bold max-w-[200px] leading-relaxed uppercase tracking-tight">
                                Toca el código QR para <br /><span className="text-cy-primary font-black">Simular el Pago Instantáneo</span>
                            </p>
                        </div>
                    </Card>
                )}

                {/* Detailed Installments */}
                <div className="mb-8">
                    <h3 className="font-black text-cy-dark mb-5 text-[12px] uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cy-dark rounded-full"></span>
                        Estado de Cuotas
                    </h3>
                    <div className="space-y-3">
                        {installments.map((installment, idx) => (
                            <div
                                key={installment.id || idx}
                                className={`flex items-center justify-between p-4 bg-white rounded-3xl border border-white shadow-premium transition-all ${installment.status === 'PAID' ? 'opacity-40 grayscale bg-gray-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-center shadow-sm ${installment.status === 'PAID' ? 'bg-gray-200' : 'bg-cy-primary text-white shadow-glow'}`}>
                                        <span className="text-[8px] font-black uppercase opacity-70">Wk</span>
                                        <span className="text-lg font-black leading-none">{idx + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-cy-dark uppercase tracking-tighter">
                                            {new Date(installment.due_date).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </p>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${installment.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {installment.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-black text-cy-dark text-lg tabular-nums">Bs. {installment.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button variant="secondary" fullWidth icon="download" className="bg-cy-dark text-white rounded-3xl h-14">
                    Resumen de Operación
                </Button>

            </div>
        </div>
    );
};