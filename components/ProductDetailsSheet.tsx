import React, { useState, useEffect } from 'react';
import { MenuItem, PromoOffer } from '../types';
import { X, Minus, Plus, Star, Clock, Flame, Info, Tag } from 'lucide-react';

interface ProductDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  activePromo: PromoOffer | null;
}

export const ProductDetailsSheet: React.FC<ProductDetailsSheetProps> = ({ isOpen, onClose, item, onAddToCart, activePromo }) => {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when item changes or opens
  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    onClose();
  };

  const originalTotal = item.price * quantity;
  const discountPct = activePromo ? activePromo.discountPercentage : 0;
  const discountedTotal = discountPct > 0 ? originalTotal * (1 - discountPct / 100) : originalTotal;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Image Header */}
        <div className="relative h-72 w-full shrink-0">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90"></div>

            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full text-dark hover:bg-white transition-colors shadow-sm"
            >
                <X size={20} />
            </button>
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {item.isPopular && (
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg border border-orange-400 w-fit">
                        <Flame size={12} className="mr-1" />
                        POPULAR
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 flex-1 overflow-y-auto -mt-12 relative z-10">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-bold text-dark leading-tight">{item.name}</h2>
                <div className="flex items-center space-x-1 bg-yellow-50 px-2.5 py-1 rounded-xl shadow-sm border border-yellow-100">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-yellow-700">{item.rating}</span>
                </div>
            </div>

            <div className="flex items-center space-x-4 text-gray-500 text-sm mb-6 font-medium">
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                    <Clock size={16} className="mr-1.5 text-primary" />
                    {item.timeEstimate}
                </div>
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                    <Info size={16} className="mr-1.5 text-blue-400" />
                    {item.calories} Kcal
                </div>
            </div>

            <h3 className="text-sm font-bold text-dark mb-2 uppercase tracking-wider">Description</h3>
            <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                {item.description}
            </p>

            <div className="pt-2">
                {/* Price Display */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-gray-400 font-bold text-lg">Total Price</span>
                    <div className="text-right">
                        {activePromo ? (
                            <div className="flex items-baseline justify-end gap-3">
                                <span className="text-sm text-gray-400 line-through">${originalTotal.toFixed(2)}</span>
                                <span className="text-3xl font-bold text-dark animate-in fade-in zoom-in duration-300">${discountedTotal.toFixed(2)}</span>
                            </div>
                        ) : (
                             <span className="text-3xl font-bold text-dark">${originalTotal.toFixed(2)}</span>
                        )}
                    </div>
                </div>

                {/* Quantity and Add Button Row */}
                <div className="flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-gray-50 rounded-2xl px-2 py-2 mr-4 shadow-sm border border-gray-100">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-dark hover:bg-white hover:shadow-sm transition-all active:scale-95"
                            disabled={quantity <= 1}
                        >
                            <Minus size={20} />
                        </button>
                        <span className="text-xl font-bold text-dark w-10 text-center">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-12 rounded-xl bg-dark text-white flex items-center justify-center shadow-lg shadow-dark/20 hover:scale-105 transition-all active:scale-95"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Add Button */}
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-primary text-dark h-[64px] rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20 flex items-center justify-center group active:scale-95"
                    >
                        <span className="font-bold text-lg">Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};