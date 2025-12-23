import React from 'react';
import { Home, ShoppingBag, Search, User, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, cartCount }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'support', icon: MessageCircle, label: 'Support' },
    { id: 'cart', icon: ShoppingBag, label: 'Bag', count: cartCount },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-dark/95 backdrop-blur-md text-white rounded-full p-2 shadow-2xl flex items-center justify-between px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-dark">
                    {item.count}
                  </span>
                )}
              </div>
              {isActive && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
