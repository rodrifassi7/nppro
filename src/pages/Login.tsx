import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { KeyRound, Mail, Loader2, ArrowRight } from 'lucide-react';

import logo from '../assets/logo.png';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { session } = useAuth();

    // Redirect if already logged in
    React.useEffect(() => {
        if (session) navigate('/');
    }, [session, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 selection:bg-green-500/30">
            <div className="w-full max-w-[400px]">

                {/* Header con estilo Minimal-Tech */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <img src={logo} alt="NP PRO Logo" className="w-80 h-auto object-contain invert-100" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <span className="h-[1px] w-8 bg-zinc-800"></span>
                        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                            Panel de Control
                        </p>
                        <span className="h-[1px] w-8 bg-zinc-800"></span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-500/20 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className=" text-[12px] font-bold text-green-600 ml-1 uppercase tracking-wider">Email institucional</label>
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@nppro.com"
                                className="w-full pl-12 pr-4 py-4 bg-[#111111] border border-zinc-800 rounded-2xl focus:bg-black focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 outline-none transition-all duration-300 text-white placeholder:text-zinc-700"
                                required
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#16a34a] transition-colors" size={20} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[12px] font-bold text-green-600 uppercase tracking-wider">Contraseña</label>
                            <a href="#" className="text-xs font-bold text-zinc-500 hover:text-[#16a34a] transition-colors">¿Olvidaste la clave?</a>
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 bg-[#111111] border border-zinc-800 rounded-2xl focus:bg-black focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 outline-none transition-all duration-300 text-white placeholder:text-zinc-700"
                                required
                            />
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#16a34a] transition-colors" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-[#16a34a] hover:text-white active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 mt-10 shadow-2xl shadow-white/5"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={22} />
                        ) : (
                            <>
                                <span className="uppercase tracking-widest text-sm">Iniciar Sesión</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <footer className="mt-12 py-6 border-t border-zinc-900 text-center">
                    <p className="text-zinc-600 text-xs font-medium">
                        Sistema de  NP PRO v1.1
                    </p>
                </footer>
            </div>
        </div>
    );
}

