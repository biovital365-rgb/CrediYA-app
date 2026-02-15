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
            // 1. Get active or disbursed loan
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

                // 2. Get existing payments
                const { data: payments } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('loan_id', loan.id)
                    .order('due_date', { ascending: true });

                if (payments && payments.length > 0) {
                    setInstallments(payments);
                } else {
                    // 3. Generate installments if none exist (First time view)
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
            // Refresh list
            await fetchLoanAndPayments();
            alert('¡Pago registrado con éxito!');
        }
        setIsPaying(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
                <div className="w-12 h-12 border-4 border-cy-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!activeLoan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#F8F9FA]">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">account_balance_wallet</span>
                <h2 className="text-xl font-bold text-cy-dark">No tienes créditos activos</h2>
                <p className="text-gray-500 mb-6">Solicita uno desde el simulador de inicio.</p>
                <Button onClick={onBack}>Volver al Inicio</Button>
            </div>
        );
    }

    const nextPayment = installments.find(p => p.status === 'PENDING');

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#F8F9FA]">

            {/* Header */}
            <div className="bg-cy-dark p-6 pb-12 rounded-b-[40px] text-white relative shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-bold">Pagar Cuota</h1>
                </div>

                <div className="flex flex-col items-center text-center">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                        {nextPayment ? 'Monto de Cuota' : 'Totalmente Pagado'}
                    </p>
                    <h2 className="text-5xl font-extrabold mb-2 tracking-tight">
                        Bs. {nextPayment ? nextPayment.amount : '0'}
                    </h2>
                    {nextPayment && (
                        <div className="bg-cy-accent/20 border border-cy-accent/50 px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cy-accent animate-pulse"></span>
                            <span className="text-xs font-bold text-cy-accent capitalize">
                                Vence: {new Date(nextPayment.due_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar -mt-8 px-5 pb-5">

                {/* Payment Method: QR Simple */}
                {nextPayment && (
                    <Card className="bg-white shadow-xl mb-6 text-center pt-8 pb-8">
                        <h3 className="text-cy-dark font-bold text-lg mb-4">Escanea para Pagar</h3>

                        <div
                            onClick={() => handleSimulatePayment(nextPayment.id)}
                            className="w-64 h-64 mx-auto bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-4 flex items-center justify-center relative mb-4 cursor-pointer hover:border-cy-primary transition-all group"
                        >
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAGO_CUOTA_${nextPayment.id}`} alt="QR Pago" className="w-full h-full opacity-90 group-hover:scale-105 transition-transform" />
                            {isPaying && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-3xl backdrop-blur-sm">
                                    <div className="w-10 h-10 border-4 border-cy-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full shadow border border-gray-100 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-gray-600">Simular escaneo QR</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 max-w-xs mx-auto">
                            (Simulación: Haz clic en el QR para marcar como pagado)
                        </p>
                    </Card>
                )}

                {/* Schedule */}
                <div className="mb-6">
                    <h3 className="font-bold text-cy-dark mb-4 px-2 text-lg">Tu Plan de Pagos</h3>
                    <div className="space-y-2">
                        {installments.map((installment, idx) => (
                            <div key={installment.id || idx} className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border ${installment.status === 'PAID' ? 'opacity-50 grayscale bg-gray-50' : 'border-transparent'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">SEM</span>
                                        <span className="text-lg font-bold text-cy-dark">{idx + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">
                                            {new Date(installment.due_date).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${installment.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {installment.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-extrabold text-cy-dark text-lg">{TEXTS.CURRENCY} {installment.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button variant="secondary" fullWidth icon="share" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                    Descargar Resumen
                </Button>

            </div>
        </div>
    );
};