import React, { useState } from 'react';
import { Phone, ArrowRight, Package, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) return;
    
    setIsLoading(true);

    // Simulate API call to fetch user or create session
    setTimeout(() => {
      const mockUser: User = {
        id: 'user-' + Date.now(),
        name: 'Guest User',
        phoneNumber: mobileNumber,
        avatarUrl: `https://ui-avatars.com/api/?name=${mobileNumber}&background=FFC529&color=1A1A1A`
      };
      
      setIsLoading(false);
      onLogin(mockUser);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 flex flex-col justify-center animate-fade-in bg-[#F9F4EC]">
      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-gray-100 transform -rotate-3 border border-gray-50">
            <Package size={36} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-dark mb-3">
            Track Orders
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Enter your mobile number to view your active orders and history.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 555-0123"
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium tracking-wide placeholder-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !mobileNumber}
            className="w-full bg-dark text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition-all transform active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>View My Orders</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
                By continuing, you agree to our Terms of Service.
            </p>
        </div>
      </div>
    </div>
  );
};