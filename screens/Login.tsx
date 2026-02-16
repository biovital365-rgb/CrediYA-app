import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Registro con metadata adicional
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Intentamos crear el perfil directamente también por seguridad
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            full_name: fullName,
                            phone: phone,
                            credit_limit: 2500,
                            current_level: 1
                        });

                    if (profileError) console.warn("Error manual profile creation:", profileError.message);
                }

                alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto mesh-gradient p-6 relative overflow-x-hidden overflow-y-auto transition-colors duration-500">

            {/* Orange/Green Decorative Elements */}
            <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-cy-primary/10 rounded-full blur-[90px] pointer-events-none"></div>
            <div className="absolute bottom-[-5%] right-[-10%] w-72 h-72 bg-cy-success/10 rounded-full blur-[90px] pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center relative z-10 py-8">

                {/* Brand Header - Reduced margin for mobile */}
                <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-900 rounded-[32px] shadow-premium border border-white/60 dark:border-white/10 mb-6 p-1">
                        <div className="w-full h-full bg-gradient-premium rounded-[26px] flex items-center justify-center shadow-glow">
                            <span className="material-symbols-outlined text-white text-4xl">bolt</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                        Credi<span className="text-cy-primary">YA</span>
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-80">El futuro del crédito digital</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-none shadow-premium p-8 rounded-[40px] animate-in slide-in-from-bottom duration-700 delay-150 relative">

                    <div className="absolute top-0 right-10 -translate-y-1/2">
                        <div className="bg-cy-success text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                            🔥 99% Aprobación
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 text-center uppercase tracking-tight">
                        {isSignUp ? 'Empieza tu Registro' : 'Inicia Sesión'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {isSignUp && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">person</span>
                                        <input
                                            type="text"
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[20px] pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-800 focus:border-cy-primary transition-all outline-none text-sm"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Celular (WhatsApp)</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">phone_iphone</span>
                                        <input
                                            type="tel"
                                            placeholder="70000000"
                                            className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[20px] pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-800 focus:border-cy-primary transition-all outline-none text-sm"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">alternate_email</span>
                                <input
                                    type="email"
                                    placeholder="hola@ejemplo.com"
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[20px] pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-800 focus:border-cy-primary transition-all outline-none text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[20px] pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-800 focus:border-cy-primary transition-all outline-none text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-tight flex-1 uppercase tracking-tighter">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            className="h-16 shadow-neon text-lg bg-cy-dark dark:bg-cy-primary"
                        >
                            {loading ? 'Procesando...' : isSignUp ? 'REGISTRARME' : 'ENTRAR'}
                        </Button>
                    </form>

                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        className="w-full mt-8 text-[11px] font-black text-cy-primary hover:text-cy-success transition-all uppercase tracking-widest"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Iniciar Sesión' : '¿No tienes cuenta? Regístrate gratis'}
                    </button>
                </Card>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center font-black uppercase tracking-widest max-w-[200px]">
                        Seguridad de Grado Bancario con <br /><span className="text-slate-600 dark:text-slate-300">Encriptación de 256 bits</span>
                    </p>
                    <div className="flex gap-4 opacity-20 grayscale dark:invert">
                        <span className="material-symbols-outlined text-2xl">verified</span>
                        <span className="material-symbols-outlined text-2xl">shield</span>
                        <span className="material-symbols-outlined text-2xl">lock</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
