import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BOLIVIAN_BANKS } from '../constants';

interface DisbursementProps {
    onFinish: () => void;
}

export const Disbursement: React.FC<DisbursementProps> = ({ onFinish }) => {
    const [method, setMethod] = useState<'qr' | 'bank' | null>(null);
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [latestLoan, setLatestLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestLoan();
    }, []);

    const fetchLatestLoan = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('loans')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'REQUESTED')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) setLatestLoan(data);
        }
        setLoading(false);
    };

    const handleFinish = async () => {
        if (latestLoan) {
            setLoading(true);
            const { error } = await supabase
                .from('loans')
                .update({ status: 'DISBURSED' })
                .eq('id', latestLoan.id);

            if (error) {
                alert('Error: ' + error.message);
            } else {
                onFinish();
            }
            setLoading(false);
        } else {
            onFinish();
        }
    };

    if (loading && !latestLoan) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!method) {
        return (
            <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 mesh-gradient animate-in slide-in-from-right duration-500">
                <header className="mt-12 mb-12 text-center">
                    <div className="inline-flex w-20 h-20 bg-white dark:bg-slate-800 rounded-[32px] shadow-premium border border-white dark:border-white/10 items-center justify-center mb-8 p-1">
                        <div className="w-full h-full bg-cy-success/10 rounded-[28px] flex items-center justify-center text-cy-success shadow-glow-green">
                            <span className="material-symbols-outlined text-[40px]">payments</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter leading-tight">¿Cómo prefieres <br />tu dinero?</h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-[0.2em] px-10">Solicitud aprobada • Bs. {latestLoan?.amount}</p>
                </header>

                <div className="space-y-4 px-2">
                    <Card
                        onClick={() => setMethod('qr')}
                        className="cursor-pointer bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/5 hover:border-cy-success/50 hover:bg-white dark:hover:bg-slate-900 shadow-premium transition-all active:scale-[0.98] transform group p-7 rounded-[36px]"
                    >
                        <div className="absolute top-0 right-0 bg-cy-success text-white text-[9px] font-black px-4 py-2 rounded-bl-[20px] tracking-widest uppercase shadow-lg">
                            Más Rápido
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-cy-success/10 rounded-2xl flex items-center justify-center text-cy-success group-hover:bg-cy-success group-hover:text-white transition-all transform group-active:scale-95 duration-300">
                                <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[13px] mb-1">Cobro por QR</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-tight tracking-widest">Instantáneo • Sin comisiones</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        onClick={() => setMethod('bank')}
                        className="cursor-pointer bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/5 hover:border-cy-primary/50 hover:bg-white dark:hover:bg-slate-900 shadow-premium transition-all active:scale-[0.98] transform group p-7 rounded-[36px]"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-cy-primary/10 rounded-2xl flex items-center justify-center text-cy-primary group-hover:bg-cy-primary group-hover:text-white transition-all transform group-active:scale-95 duration-300">
                                <span className="material-symbols-outlined text-[32px]">account_balance</span>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[13px] mb-1">Transferencia</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-tight tracking-widest">A tu cuenta personal</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto mesh-gradient p-6 items-center justify-center animate-in zoom-in duration-500">

            <Card className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-none shadow-premium p-10 text-center pt-14 rounded-[48px]">
                {method === 'qr' ? (
                    <div>
                        <div className="w-60 h-60 mx-auto bg-white p-4 mb-10 shadow-xl border border-slate-50 rounded-[40px] flex items-center justify-center relative group">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DISBURSE_LOAN_${latestLoan?.id}&color=10b981`}
                                alt="QR Desembolso"
                                className="w-full h-full transition-transform group-hover:scale-95"
                            />
                            <div className="absolute inset-0 border-[12px] border-white rounded-[40px]"></div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter">¡Listo para Cobrar!</h2>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-relaxed max-w-[220px] mx-auto mb-12 tracking-[0.1em]">
                            Escanea este código desde tu banca móvil para recibir tus <span className="text-cy-success font-black">Bs. {latestLoan?.amount}</span>
                        </p>
                    </div>
                ) : (
                    <div className="w-full">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-10">Selecciona tu Banco</h2>
                        <div className="grid grid-cols-2 gap-4 mb-12">
                            {BOLIVIAN_BANKS.map((bank) => (
                                <button
                                    key={bank.id}
                                    onClick={() => setSelectedBank(bank.id)}
                                    className={`p-5 rounded-[24px] border-2 text-[10px] uppercase font-black tracking-widest transition-all duration-300 ${selectedBank === bank.id ? 'border-cy-primary bg-cy-primary text-white shadow-glow' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:border-slate-200'}`}
                                >
                                    {bank.name.split(' ').slice(1, 3).join(' ') || bank.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {method === 'bank' && selectedBank && (
                    <div className="animate-in fade-in slide-in-from-bottom duration-500 mb-10 p-5 bg-cy-success/10 rounded-[24px] border border-cy-success/20">
                        <p className="text-xs font-black text-cy-success uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">verified</span> Procesando Envío
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    {(method === 'qr' || (method === 'bank' && selectedBank)) && (
                        <Button
                            fullWidth
                            onClick={handleFinish}
                            disabled={loading}
                            className="h-16 text-lg shadow-neon bg-cy-dark dark:bg-cy-primary dark:text-white"
                            icon="check_circle"
                        >
                            {loading ? 'Finalizando...' : '¡YA LO RECIBÍ!'}
                        </Button>
                    )}

                    <button
                        onClick={() => setMethod(null)}
                        className="w-full font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-cy-primary transition-colors py-4"
                    >
                        Cambiar método de cobro
                    </button>
                </div>
            </Card>

        </div>
    );
};