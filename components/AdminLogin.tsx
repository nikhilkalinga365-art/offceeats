import React, { useState } from 'react';
import { Lock, ArrowLeft, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        if (email === 'admin@renok.in' && password === '12345') {
            onLoginSuccess();
        } else {
            setError('Invalid credentials. Please check your email and password.');
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col animate-fade-in relative overflow-hidden font-sans">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header / Back Button */}
        <div className="p-6 pt-8 md:p-8 z-10">
            <button 
                onClick={onBack}
                className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full w-fit hover:bg-white/10"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to App</span>
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-12 md:pb-0 z-10">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex relative mb-6 group">
                        <div className="absolute inset-0 bg-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                            <ShieldCheck size={36} className="text-primary" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h2>
                    <p className="text-gray-400 text-sm md:text-base">Enter your secure credentials to manage operations</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 text-red-200 text-sm animate-fade-in">
                            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="admin@renok.in"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-dark font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-yellow-400 hover:shadow-primary/40 transition-all flex items-center justify-center space-x-2 mt-6 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Access Dashboard</span>
                                <ArrowLeft size={18} className="rotate-180" />
                            </>
                        )}
                    </button>
                    
                    <div className="text-center mt-6">
                        <button type="button" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 text-center text-[10px] text-gray-600 z-10">
            <p>Protected by Renok Security Systems v2.1</p>
        </div>
    </div>
  );
};