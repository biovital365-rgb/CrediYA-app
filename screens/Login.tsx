import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
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
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#F8F9FA] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-cy-primary/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-cy-accent/10 rounded-full blur-[60px]"></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-primary rounded-3xl mx-auto flex items-center justify-center shadow-glow mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">bolt</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-cy-dark tracking-tight">CrediYA</h1>
                    <p className="text-gray-500 font-medium">Préstamos al instante en tu bolsillo</p>
                </div>

                <Card className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-cy-dark mb-6">
                        {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-cy-primary focus:ring-2 focus:ring-cy-primary/20 outline-none transition-all font-medium"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-cy-primary focus:ring-2 focus:ring-cy-primary/20 outline-none transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && <p className="text-cy-accent text-xs font-bold bg-cy-accent/10 p-3 rounded-lg">{error}</p>}

                        <Button
                            fullWidth
                            type="submit"
                            disabled={loading}
                            className="h-14 text-lg shadow-lg shadow-cy-primary/20"
                        >
                            {loading ? 'Procesando...' : (isSignUp ? 'Registrarme' : 'Entrar')}
                        </Button>
                    </form>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full mt-6 text-sm font-bold text-cy-primary hover:underline"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo? Crea una cuenta'}
                    </button>
                </Card>

                <p className="text-center text-[10px] text-gray-400 mt-8 font-medium">
                    Al continuar, aceptas nuestros Términos y Política de Privacidad.
                </p>
            </div>
        </div>
    );
};
