import React, { useState, useEffect } from 'react';
import { CartItem, User, Order, RestaurantSettings, PromoOffer } from '../types';
import { X, Minus, Plus, Armchair, ArrowRight, ShoppingBag, Phone, Clock, Store, Tag, User as UserIcon } from 'lucide-react';
import { OrderReceipt } from './OrderReceipt';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  user: User | null;
  onLogin: (user: User) => void;
  onPlaceOrder: (order: Order) => void;
  settings: RestaurantSettings;
  activePromo: PromoOffer | null;
}

export const CartSheet: React.FC<CartSheetProps> = ({ 
    isOpen, 
    onClose, 
    cart, 
    updateQuantity, 
    clearCart, 
    user, 
    onLogin, 
    onPlaceOrder,
    settings,
    activePromo
}) => {
  const [seatNumber, setSeatNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'desk' | 'pickup'>('desk');
  
  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Time Restriction Logic based on Admin Settings
  const currentHour = new Date().getHours();
  // Check if current time is within the window AND globally enabled
  const isDeskDeliveryAvailable = settings.isDeskDeliveryEnabled && 
                                  currentHour >= settings.deliveryStartHour && 
                                  currentHour < settings.deliveryEndHour;

  // Auto-switch to pickup if desk delivery is unavailable
  useEffect(() => {
    if (!isDeskDeliveryAvailable && deliveryMethod === 'desk') {
        setDeliveryMethod('pickup');
    }
  }, [isDeskDeliveryAvailable, deliveryMethod]);

  // Pre-fill mobile number if user is logged in
  useEffect(() => {
    if (user?.phoneNumber) {
      setMobileNumber(user.phoneNumber);
    }
  }, [user]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = activePromo ? (subtotal * (activePromo.discountPercentage / 100)) : 0;
  const total = subtotal - discountAmount;

  const handleCheckout = () => {
    if (deliveryMethod === 'desk' && !seatNumber) return;
    if (!mobileNumber) return;
    
    // Create user session if not exists
    if (!user) {
        onLogin({
            id: 'user-' + Date.now(),
            name: 'Guest',
            phoneNumber: mobileNumber,
            avatarUrl: `https://ui-avatars.com/api/?name=Guest&background=FFC529&color=1A1A1A`
        });
    }

    const newOrder: Order = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date(),
        items: [...cart],
        subtotal,
        discount: discountAmount,
        total,
        deliveryMethod,
        seatNumber: seatNumber,
        mobileNumber,
        status: 'Processing'
    };

    setConfirmedOrder(newOrder);
    onPlaceOrder(newOrder);
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setConfirmedOrder(null);
    clearCart();
    setSeatNumber('');
    onClose();
  };

  if (!isOpen && !showReceipt) return null;

  const isPickup = deliveryMethod === 'pickup';

  return (
    <>
      {showReceipt && confirmedOrder && (
          <OrderReceipt order={confirmedOrder} onClose={handleCloseReceipt} />
      )}
      
      <div className={`fixed inset-0 z-[60] flex justify-end ${!isOpen ? 'pointer-events-none' : ''}`}>
        {/* Backdrop */}
        <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={onClose}
        ></div>

        {/* Sheet */}
        <div className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2">
                Your Order
                <span className="bg-primary/20 text-dark text-xs px-2 py-1 rounded-full">{cart.length} items</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
            </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!settings.isStoreOpen && cart.length > 0 && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 flex items-center gap-3 mb-2">
                    <Store size={20} />
                    <div className="text-sm">
                        <p className="font-bold">Store is currently closed.</p>
                        <p>We are not accepting orders at this time.</p>
                    </div>
                </div>
            )}
            
            {activePromo && cart.length > 0 && (
                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-green-700 flex items-center gap-3 animate-fade-in">
                    <Tag size={18} className="fill-green-100" />
                    <div className="text-sm">
                        <p className="font-bold text-green-800">{activePromo.title} Applied!</p>
                        <p className="text-xs">You're saving {activePromo.discountPercentage}% on this order.</p>
                    </div>
                </div>
            )}

            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={36} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-lg text-dark mb-2">Your cart is empty</h3>
                <p className="text-sm max-w-[200px]">Looks like you haven't added anything to your cart yet.</p>
                <button onClick={onClose} className="mt-6 text-primary font-bold hover:underline">Start Browsing</button>
                </div>
            ) : (
                cart.map((item) => {
                  const originalItemTotal = item.price * item.quantity;
                  const discountPct = activePromo ? activePromo.discountPercentage : 0;
                  const discountedItemTotal = discountPct > 0 ? originalItemTotal * (1 - discountPct / 100) : originalItemTotal;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 bg-white">
                        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-100" />
                        <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-dark text-sm">{item.name}</h3>
                            <div className="flex flex-col items-end">
                                {activePromo ? (
                                    <div className="flex items-baseline space-x-2">
                                       <p className="text-xs text-gray-400 line-through">${originalItemTotal.toFixed(2)}</p>
                                       <p className="font-bold text-dark text-sm">${discountedItemTotal.toFixed(2)}</p>
                                    </div>
                                ) : (
                                    <p className="font-bold text-dark text-sm">${originalItemTotal.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">${item.price.toFixed(2)} each</p>
                        <div className="flex items-center space-x-3">
                            <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500"
                            >
                            <Minus size={14} />
                            </button>
                            <span className="font-bold text-dark text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-dark text-white flex items-center justify-center hover:bg-black shadow-md shadow-dark/20"
                            >
                            <Plus size={14} />
                            </button>
                        </div>
                        </div>
                    </div>
                  );
                })
            )}
            </div>

            {cart.length > 0 && (
            <div className="p-6 bg-[#FEFBF5] border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                
                {/* Delivery Method Toggle */}
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                    onClick={() => isDeskDeliveryAvailable && setDeliveryMethod('desk')}
                    disabled={!isDeskDeliveryAvailable}
                    className={`relative p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    deliveryMethod === 'desk' 
                        ? 'border-primary bg-primary/10 text-dark ring-1 ring-primary' 
                        : isDeskDeliveryAvailable
                            ? 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                    }`}
                >
                    <Armchair size={20} className={deliveryMethod === 'desk' ? 'text-dark' : 'text-gray-400'} />
                    <span className="text-xs font-bold">Desk Delivery</span>
                    {!isDeskDeliveryAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl backdrop-blur-[1px]">
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Closed</span>
                        </div>
                    )}
                </button>
                
                <button 
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    deliveryMethod === 'pickup' 
                        ? 'border-primary bg-primary/10 text-dark ring-1 ring-primary' 
                        : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <ShoppingBag size={20} className={deliveryMethod === 'pickup' ? 'text-dark' : 'text-gray-400'} />
                    <span className="text-xs font-bold">Self Pickup</span>
                </button>
                </div>
                
                {!isDeskDeliveryAvailable && settings.isDeskDeliveryEnabled && (
                    <div className="flex items-start space-x-2 bg-orange-50 p-3 rounded-xl mb-6 text-xs text-orange-700 border border-orange-100">
                        <Clock size={14} className="mt-0.5 shrink-0" />
                        <span>Desk delivery is only available between {settings.deliveryStartHour}:00 and {settings.deliveryEndHour}:00.</span>
                    </div>
                )}
                
                {!settings.isDeskDeliveryEnabled && (
                    <div className="flex items-start space-x-2 bg-gray-100 p-3 rounded-xl mb-6 text-xs text-gray-500 border border-gray-200">
                        <Armchair size={14} className="mt-0.5 shrink-0" />
                        <span>Desk delivery is currently disabled by the administrator.</span>
                    </div>
                )}

                {/* Input Fields */}
                <div className="space-y-4 mb-6">
                    
                    {/* Contact Info (Mobile or Name) - Always Required */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                            {isPickup ? 'Employee Full Name' : 'Mobile Number'}
                        </label>
                        <div className="relative">
                            {isPickup ? (
                                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            ) : (
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            )}
                            <input
                            type={isPickup ? "text" : "tel"}
                            placeholder={isPickup ? "e.g. John Doe" : "e.g. 555-0123"}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-dark text-sm"
                            />
                        </div>
                    </div>

                    {/* Seat Number - Conditional */}
                    {deliveryMethod === 'desk' && (
                        <div className="animate-fade-in">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Seat / Desk Number</label>
                        <div className="relative">
                            <Armchair className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                            type="text"
                            placeholder="e.g. Desk 4B"
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-dark text-sm"
                            />
                        </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-dark">${subtotal.toFixed(2)}</span>
                    </div>
                    {activePromo && (
                        <div className="flex justify-between items-center text-sm text-green-600 animate-fade-in">
                            <span className="flex items-center"><Tag size={12} className="mr-1"/> Discount ({activePromo.discountPercentage}%)</span>
                            <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                </div>
                
                <button
                disabled={!settings.isStoreOpen || (deliveryMethod === 'desk' && !seatNumber) || !mobileNumber}
                onClick={handleCheckout}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-xl ${
                    (!settings.isStoreOpen || (deliveryMethod === 'desk' && !seatNumber) || !mobileNumber)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-primary text-dark hover:bg-yellow-400 hover:shadow-primary/40 active:scale-95'
                }`}
                >
                    <div className="flex flex-col items-center leading-tight">
                        <span className="text-base">
                            {deliveryMethod === 'desk' ? 'Pay at Delivery' : 'Pay at Counter'}
                        </span>
                        <span className="text-xs opacity-80 font-medium">Total: ${total.toFixed(2)}</span>
                    </div>
                    <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
            )}
        </div>
    </div>
    </>
  );
};