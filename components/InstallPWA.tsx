import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-fade-in-up">
      <div className="bg-dark/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-dark shadow-lg shadow-primary/20">
             <Smartphone size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Install App</h3>
            <p className="text-xs text-gray-400">Add to home screen for faster access</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
                <X size={18} />
            </button>
            <button 
                onClick={handleInstallClick}
                className="bg-primary text-dark font-bold px-4 py-2 rounded-xl text-xs hover:bg-yellow-400 transition-colors shadow-lg active:scale-95 flex items-center gap-1"
            >
                <Download size={14} />
                Install
            </button>
        </div>
      </div>
    </div>
  );
};