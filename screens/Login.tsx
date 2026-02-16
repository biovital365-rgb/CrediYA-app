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
                alert('Revisa tu email para confirmar tu cuenta');
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
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto mesh-gradient p-6 relative overflow-hidden">

            {/* Decorative Blur Elements */}
            <div className="absolute top-[-5%] left-[-10%] w-64 h-64 bg-cy-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-5%] right-[-10%] w-64 h-64 bg-cy-accent/15 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center relative z-10 py-10">

                {/* Brand Header */}
                <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[32px] shadow-premium border border-white/60 mb-6">
                        <div className="w-14 h-14 bg-gradient-primary rounded-[22px] flex items-center justify-center shadow-glow">
                            <span className="material-symbols-outlined text-white text-4xl">bolt</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-cy-dark tracking-tighter mb-2">Credi<span className="text-cy-primary">YA</span></h1>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest opacity-80">Préstamos al instante en tu bolsillo</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-white/80 backdrop-blur-2xl border-none shadow-premium p-8 animate-in slide-in-from-bottom duration-700 delay-150">
                    <h2 className="text-2xl font-black text-cy-dark mb-8 text-center">
                        {isSignUp ? 'Empieza tu Camino' : 'Bienvenido de nuevo'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-cy-dark font-bold focus:bg-white focus:border-cy-primary focus:ring-4 focus:ring-cy-primary/10 transition-all outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                                <input
                                    type="password"
                                    placeholder="********"
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-cy-dark font-bold focus:bg-white focus:border-cy-primary focus:ring-4 focus:ring-cy-primary/10 transition-all outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-cy-accent/10 border border-cy-accent/20 p-4 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-cy-accent text-[20px]">error</span>
                                <p className="text-xs text-cy-accent font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            className="h-15 shadow-neon text-lg"
                        >
                            {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Entrar'}
                        </Button>
                    </form>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full mt-8 text-sm font-bold text-cy-primary hover:text-cy-dark transition-colors uppercase tracking-tight"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo? Crea una cuenta'}
                    </button>
                </Card>

                {/* Bottom Footer */}
                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-tighter mt-10">
                    Al continuar, aceptas nuestros <span className="text-cy-dark underline">Términos</span> y <span className="text-cy-dark underline">Privacidad</span>.
                </p>

            </div>
        </div>
    );
};
