import React, { useState, useEffect } from 'react';
import { PromoOffer } from '../types';
import { Clock, TrendingUp } from 'lucide-react';

interface PromoBannerProps {
  offer: PromoOffer;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ offer }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'upcoming' | 'expired' | 'dynamic'>('active');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = offer.startDate.getTime();
      const end = offer.expiryDate.getTime();
      
      if (now < start) {
        setStatus('upcoming');
        const difference = start - now;
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        return `Starts in ${hours}h ${minutes}m`;
      } else if (now >= start && now < end) {
        setStatus('active');
        const difference = end - now;
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${hours}h ${minutes}m ${seconds}s left`;
      } else {
        // Expired or Dynamic Phase
        if (offer.enableDynamicPricing && offer.priceIncreaseInterval) {
            // Check if reduction has killed the discount entirely
            if (offer.discountPercentage <= 0) {
                 setStatus('expired');
                 return 'Expired';
            }

            setStatus('dynamic');
            // Calculate time until NEXT price increase
            const minutesOver = Math.floor((now - end) / 60000);
            const interval = offer.priceIncreaseInterval;
            const nextStepIndex = Math.floor(minutesOver / interval) + 1;
            const nextStepTime = end + (nextStepIndex * interval * 60000);
            const difference = nextStepTime - now;
            
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            return `Price +${offer.priceIncreaseStep}% in ${minutes}m ${seconds}s`;
        } else {
            setStatus('expired');
            return 'Expired';
        }
      }
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [offer.startDate, offer.expiryDate, offer.discountPercentage]);

  if (status === 'expired') return null;

  return (
    <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg group">
      <img 
        src={offer.image} 
        alt={offer.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${status === 'dynamic' ? 'from-orange-900/90 via-orange-800/50' : 'from-black/80 via-black/40'} to-transparent`}></div>
      
      <div className="absolute inset-0 p-6 flex flex-col justify-center items-start text-white">
        <div className={`flex items-center space-x-2 backdrop-blur-md px-3 py-1 rounded-full mb-3 border ${
             status === 'active' 
                ? 'bg-primary/20 border-primary/30 text-primary' 
                : status === 'dynamic'
                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 animate-pulse'
                    : 'bg-white/20 border-white/30 text-white'
        }`}>
          {status === 'dynamic' ? <TrendingUp size={14} className="text-orange-400" /> : <Clock size={14} className={status === 'active' ? "text-primary" : "text-white"} />}
          <span className="text-xs font-semibold">{timeLeft}</span>
        </div>
        
        <h2 className="text-2xl font-bold leading-tight max-w-[70%] mb-1">
          {offer.title}
        </h2>
        <p className="text-gray-300 text-sm mb-4">{offer.subtitle}</p>
        
        {status === 'active' && (
            <div className="bg-primary text-dark font-bold py-2 px-5 rounded-full text-sm shadow-md inline-block">
            {offer.discountPercentage.toFixed(0)}% OFF Active Now
            </div>
        )}
        {status === 'dynamic' && (
            <div className="bg-orange-500 text-white font-bold py-2 px-5 rounded-full text-sm shadow-md inline-block">
            Hurry! Only {offer.discountPercentage.toFixed(0)}% OFF Left
            </div>
        )}
        {status === 'upcoming' && (
            <div className="bg-white/20 backdrop-blur-sm text-white font-bold py-2 px-5 rounded-full text-sm border border-white/30 inline-block">
            Coming Soon
            </div>
        )}
      </div>
    </div>
  );
};