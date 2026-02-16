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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-[3px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!method) {
        return (
            <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 mesh-gradient animate-in slide-in-from-right duration-500">
                <header className="mt-10 mb-10 text-center">
                    <div className="inline-flex w-16 h-16 bg-white rounded-2xl shadow-premium border border-white items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-cy-teal text-3xl">payments</span>
                    </div>
                    <h1 className="text-3xl font-black text-cy-dark mb-2 tracking-tighter">¿Cómo cobramos?</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest px-10">Tu dinero está aprobado, elige donde recibirlo</p>
                </header>

                <div className="space-y-4">
                    <Card
                        onClick={() => setMethod('qr')}
                        className="cursor-pointer bg-white/70 backdrop-blur-xl border border-white hover:border-cy-teal/50 hover:bg-white shadow-premium transition-all group p-6"
                    >
                        <div className="absolute top-0 right-0 bg-cy-teal text-white text-[9px] font-black px-3 py-1.5 rounded-bl-2xl tracking-[0.1em]">
                            RECOMENDADO
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-cy-teal/10 rounded-2xl flex items-center justify-center text-cy-teal group-hover:bg-cy-teal group-hover:text-white transition-all transform group-active:scale-90">
                                <span className="material-symbols-outlined text-3xl">qr_code_2</span>
                            </div>
                            <div>
                                <h3 className="font-black text-cy-dark uppercase tracking-tight text-sm">Cobro QR Simple</h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase leading-tight mt-0.5">Instantáneo • 24/7 • Sin comisión</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        onClick={() => setMethod('bank')}
                        className="cursor-pointer bg-white/70 backdrop-blur-xl border border-white hover:border-cy-primary/50 hover:bg-white shadow-premium transition-all group p-6"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-cy-primary/10 rounded-2xl flex items-center justify-center text-cy-primary group-hover:bg-cy-primary group-hover:text-white transition-all transform group-active:scale-90">
                                <span className="material-symbols-outlined text-3xl">account_balance</span>
                            </div>
                            <div>
                                <h3 className="font-black text-cy-dark uppercase tracking-tight text-sm">Transf. Bancaria</h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase leading-tight mt-0.5">Tu cuenta • Demo Banco • Seguro</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto mesh-gradient p-6 items-center justify-center animate-in zoom-in-95 duration-500">

            <Card className="w-full bg-white/80 backdrop-blur-2xl border-none shadow-premium p-8 text-center pt-10">
                {method === 'qr' ? (
                    <div>
                        <div className="w-56 h-56 mx-auto bg-white rounded-[48px] p-6 mb-8 shadow-premium border border-gray-100 flex items-center justify-center relative">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CREDITO_APROBADO_${latestLoan?.id}`}
                                alt="QR"
                                className="w-full h-full opacity-100"
                            />
                            <div className="absolute inset-0 border-[8px] border-white rounded-[48px]"></div>
                        </div>
                        <h2 className="text-2xl font-black text-cy-dark mb-2 tracking-tighter uppercase">¡A Escanear!</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed max-w-[200px] mx-auto mb-10 tracking-tight">
                            Abre tu app bancaria y recibe tus <span className="text-cy-dark font-black">Bs. {latestLoan?.amount || 1000}</span>
                        </p>
                    </div>
                ) : (
                    <div className="w-full">
                        <h2 className="text-lg font-black text-cy-dark uppercase tracking-widest mb-6">Selecciona tu Entidad</h2>
                        <div className="grid grid-cols-2 gap-3 mb-10">
                            {BOLIVIAN_BANKS.map((bank) => (
                                <button
                                    key={bank.id}
                                    onClick={() => setSelectedBank(bank.id)}
                                    className={`p-3.5 rounded-2xl border-2 text-[10px] uppercase font-black tracking-widest transition-all ${selectedBank === bank.id ? 'border-cy-primary bg-cy-primary text-white shadow-glow' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                >
                                    {bank.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {method === 'bank' && selectedBank && (
                    <div className="animate-in fade-in slide-in-from-bottom duration-500 mb-8 p-4 bg-cy-teal/10 rounded-2xl border border-cy-teal/20">
                        <p className="text-xs font-black text-cy-teal uppercase tracking-widest">💸 Procesando Envío</p>
                    </div>
                )}

                <div className="space-y-4">
                    {(method === 'qr' || (method === 'bank' && selectedBank)) && (
                        <Button
                            fullWidth
                            onClick={handleFinish}
                            disabled={loading}
                            className="h-16 text-lg shadow-neon bg-cy-dark text-white"
                            icon="check_circle"
                        >
                            {loading ? 'Confirmando...' : 'DINERO RECIBIDO'}
                        </Button>
                    )}

                    <button
                        onClick={() => setMethod(null)}
                        className="w-full font-black text-[10px] text-gray-400 uppercase tracking-widest hover:text-cy-primary transition-colors py-2"
                    >
                        Cambiar método de cobro
                    </button>
                </div>
            </Card>

        </div>
    );
};