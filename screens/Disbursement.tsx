import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
            const { data, error } = await supabase
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
                alert('Error al actualizar préstamo: ' + error.message);
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
            <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
                <div className="w-12 h-12 border-4 border-cy-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!method) {
        return (
            <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 animate-in slide-in-from-right duration-300 bg-[#F8F9FA]">
                <h1 className="text-2xl font-extrabold text-cy-dark mb-2 mt-8">¿Cómo quieres tu dinero? 💸</h1>
                <p className="text-gray-500 mb-8">Elige el método más rápido para ti.</p>

                <div className="space-y-4">
                    <button
                        onClick={() => setMethod('qr')}
                        className="w-full bg-white p-5 rounded-2xl shadow-soft border-2 border-transparent hover:border-cy-teal transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-cy-teal text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">
                            RECOMENDADO
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-cy-teal/10 rounded-full flex items-center justify-center text-cy-teal group-hover:bg-cy-teal group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-cy-dark">QR Simple</h3>
                                <p className="text-xs text-gray-500">Instantáneo. A cualquier banco.</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setMethod('bank')}
                        className="w-full bg-white p-5 rounded-2xl shadow-soft border-2 border-transparent hover:border-cy-primary transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-cy-primary/10 rounded-full flex items-center justify-center text-cy-primary group-hover:bg-cy-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">account_balance</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-cy-dark">Transferencia Bancaria</h3>
                                <p className="text-xs text-gray-500">A tu cuenta registrada.</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 items-center justify-center animate-in zoom-in-95 duration-500 bg-white">

            {method === 'qr' ? (
                <div className="text-center w-full">
                    <div className="w-48 h-48 mx-auto bg-white border-4 border-cy-dark rounded-3xl p-2 mb-6 shadow-xl relative">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CREDITO_APROBADO_${latestLoan?.id}`} alt="QR" className="w-full h-full mix-blend-multiply opacity-90" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/90 p-2 rounded-full shadow-md">
                                <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-extrabold text-cy-dark mb-1">¡Listo para cobrar!</h2>
                    <p className="text-sm text-gray-500 mb-8 max-w-[250px] mx-auto">
                        Escanea este QR desde tu banca móvil para recibir tus <span className="font-bold text-cy-dark">Bs. {latestLoan?.amount || 1000}</span> al instante.
                    </p>
                </div>
            ) : (
                <div className="w-full">
                    <h2 className="text-xl font-bold mb-4">Selecciona tu Banco</h2>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {BOLIVIAN_BANKS.map((bank) => (
                            <button
                                key={bank.id}
                                onClick={() => setSelectedBank(bank.id)}
                                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${selectedBank === bank.id ? 'border-cy-primary bg-cy-primary/5 text-cy-primary' : 'border-gray-200 text-gray-600'}`}
                            >
                                {bank.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {method === 'bank' && selectedBank && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500 w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-green-600">done_all</span>
                    </div>
                    <h3 className="text-xl font-bold text-cy-dark">Transferencia en Camino</h3>
                    <p className="text-sm text-gray-500 mb-6">Recibirás Bs. {latestLoan?.amount || 1000} en unos minutos.</p>
                </div>
            )}

            <div className="w-full mt-auto">
                {(method === 'qr' || (method === 'bank' && selectedBank)) && (
                    <Button
                        fullWidth
                        variant="primary"
                        onClick={handleFinish}
                        disabled={loading}
                        className="h-14 text-lg shadow-glow"
                    >
                        {loading ? 'Finalizando...' : 'Entendido, ir al Inicio'}
                    </Button>
                )}

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => setMethod(null)}
                    className="font-bold text-gray-400 mt-2"
                >
                    Cambiar método
                </Button>
            </div>

        </div>
    );
};