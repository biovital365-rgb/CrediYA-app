import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto mesh-gradient p-6 relative overflow-hidden transition-colors duration-500">

            {/* Orange/Green Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-cy-primary/10 rounded-full blur-[90px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-cy-success/10 rounded-full blur-[90px] pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center relative z-10 py-10">

                {/* Brand Header */}
                <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-slate-900 rounded-[36px] shadow-premium border border-white/60 dark:border-white/10 mb-8 p-1">
                        <div className="w-full h-full bg-gradient-premium rounded-[30px] flex items-center justify-center shadow-glow">
                            <span className="material-symbols-outlined text-white text-5xl">bolt</span>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
                        Credi<span className="text-cy-primary">YA</span>
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-[0.3em] opacity-80">El futuro del crédito digital</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-none shadow-premium p-10 rounded-[40px] animate-in slide-in-from-bottom duration-700 delay-150 relative">

                    <div className="absolute top-0 right-10 -translate-y-1/2">
                        <div className="bg-cy-success text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                            🔥 99% Aprobación
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-10 text-center">
                        {isSignUp ? 'Únete a la Revolución' : 'Bienvenido de Nuevo'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tu Correo Electrónico</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">alternate_email</span>
                                <input
                                    type="email"
                                    placeholder="hola@ejemplo.com"
                                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-800 focus:border-cy-primary focus:ring-4 focus:ring-cy-primary/5 transition-all outline-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contraseña Segura</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-800 focus:border-cy-primary focus:ring-4 focus:ring-cy-primary/5 transition-all outline-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                                <p className="text-xs text-red-600 dark:text-red-400 font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            className="h-16 shadow-neon text-lg bg-cy-dark dark:bg-cy-primary"
                        >
                            {loading ? 'Validando...' : isSignUp ? 'COMENZAR AHORA' : 'ENTRAR A MI CUENTA'}
                        </Button>
                    </form>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full mt-10 text-xs font-black text-cy-primary hover:text-cy-success transition-all uppercase tracking-widest"
                    >
                        {isSignUp ? '¿Ya eres miembro? Iniciar Sesión' : '¿Aún sin cuenta? Regístrate'}
                    </button>
                </Card>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-black uppercase tracking-widest max-w-[280px]">
                        Seguridad de Grado Bancario con <span className="text-slate-600 dark:text-slate-300">Encriptación de 256 bits</span>
                    </p>
                    <div className="flex gap-4 opacity-30 grayscale dark:invert">
                        <span className="material-symbols-outlined text-3xl">verified</span>
                        <span className="material-symbols-outlined text-3xl">shield</span>
                        <span className="material-symbols-outlined text-3xl">lock</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
