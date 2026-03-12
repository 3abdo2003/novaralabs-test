import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ShieldAlert } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simple authentication logic for demonstration
        // In a real app, this would be an API call
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/admin');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 to-transparent pointer-events-none"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                        <Lock className="w-8 h-8" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Admin Access</h1>
                    <p className="text-zinc-500 text-sm font-medium">Please enter your credentials to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase ml-1">Username</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-orange-500 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-orange-500 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm"
                        >
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-orange-500 text-white rounded-xl py-4 font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/10 mt-8"
                    >
                        Login to Dashboard
                    </button>
                </form>
            </motion.div>

            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase">Novara Labs Centralized Admin System</p>
            </div>
        </div>
    );
};

export default AdminLogin;
