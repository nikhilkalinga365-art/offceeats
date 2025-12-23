import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, ShoppingCart, Plus, Star, Clock, Flame, ChevronDown, X, Tag, Percent } from 'lucide-react';
import { ACTIVE_PROMO, CATEGORIES, MENU_ITEMS } from './constants';
import { CartItem, CategoryType, MenuItem, User, Order, PromoOffer, RestaurantSettings, Category } from './types';
import { PromoBanner } from './components/PromoBanner';
import { BottomNav } from './components/BottomNav';
import { CartSheet } from './components/CartSheet';
import { AiAssistant } from './components/AiAssistant';
import { AuthScreen } from './components/AuthScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ProductDetailsSheet } from './components/ProductDetailsSheet';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { InstallPWA } from './components/InstallPWA';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string>(CategoryType.ALL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Global App State
  const [promotions, setPromotions] = useState<PromoOffer[]>([ACTIVE_PROMO]);
  const [settings, setSettings] = useState<RestaurantSettings>({
      isStoreOpen: true,
      isDeskDeliveryEnabled: true,
      deliveryStartHour: 11,
      deliveryEndHour: 15,
      supportContact: 'support@renok.in',
      stallNumber: '6'
  });

  // Time & Promo Logic
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update 'now' every second to ensure promo timers and availability are accurate
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activePromo = useMemo(() => {
    // 1. Filter promos that have started
    const startedPromos = promotions.filter(p => now >= p.startDate);

    // 2. Map to calculated effective discount based on dynamic rules
    const calculatedPromos = startedPromos.map(p => {
        let effectiveDiscount = p.discountPercentage;
        
        // Check if expired
        if (now > p.expiryDate) {
            // If Dynamic Pricing Enabled:
            if (p.enableDynamicPricing && p.priceIncreaseInterval && p.priceIncreaseStep) {
                const minutesOver = Math.floor((now.getTime() - p.expiryDate.getTime()) / 60000);
                const steps = Math.floor(minutesOver / p.priceIncreaseInterval);
                const reduction = steps * p.priceIncreaseStep;
                
                // Effective discount is reduced over time
                effectiveDiscount = Math.max(0, p.discountPercentage - reduction);
            } else {
                // Normal Expiry
                effectiveDiscount = 0;
            }
        }
        
        return { ...p, discountPercentage: effectiveDiscount };
    });

    // 3. Filter out effectively expired promos (0 discount)
    const validPromos = calculatedPromos.filter(p => p.discountPercentage > 0);
    
    if (validPromos.length === 0) return null;
    
    // 4. Return the best available offer
    return validPromos.sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  }, [promotions, now]);

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginPageOpen, setIsLoginPageOpen] = useState(false);

  // Product Details State
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Auto-switch to ALL category when searching
  useEffect(() => {
    if (searchQuery) {
      setSelectedCategory(CategoryType.ALL);
    }
  }, [searchQuery]);

  // Cart Logic
  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === CategoryType.ALL || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, menuItems]);

  // Handle Tab Switching
  const handleTabChange = (tab: string) => {
    if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'support') {
      setIsAiOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Completed' | 'Processing' | 'Cancelled') => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Admin Routing Logic
  if (isLoginPageOpen) {
      return (
          <AdminLogin 
            onLoginSuccess={() => {
                setIsLoginPageOpen(false);
                setIsAdminMode(true);
            }} 
            onBack={() => setIsLoginPageOpen(false)} 
          />
      );
  }

  if (isAdminMode) {
    return (
        <AdminDashboard 
            orders={orders}
            menuItems={menuItems}
            promotions={promotions}
            settings={settings}
            categories={categories}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateMenu={setMenuItems}
            onUpdatePromotions={setPromotions}
            onUpdateSettings={setSettings}
            onUpdateCategories={setCategories}
            onLogout={() => setIsAdminMode(false)}
        />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F4EC] font-sans selection:bg-primary/30">
      
      {/* Install PWA Prompt */}
      <InstallPWA />

      {/* Home View */}
      {activeTab === 'home' && (
        <>
          <header className="sticky top-0 z-40 bg-[#F9F4EC]/95 backdrop-blur-sm px-6 py-4 min-h-[72px] flex items-center justify-between transition-all">
            {isSearchOpen ? (
               // Search Mode Header
               <div className="flex-1 flex items-center space-x-3 animate-fade-in w-full">
                  <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input 
                        type="text"
                        autoFocus
                        placeholder="Search for food..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white rounded-full shadow-sm border-none focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                     />
                  </div>
                  <button 
                    onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSelectedCategory(CategoryType.ALL);
                    }}
                    className="p-3 bg-white rounded-full shadow-sm text-dark hover:bg-gray-50 transition-colors"
                  >
                    <X size={20} />
                  </button>
               </div>
            ) : (
               // Default Header
               <div className="w-full flex items-center justify-between animate-fade-in">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-dark cursor-pointer hover:bg-gray-50 transition-transform active:scale-95"
                  >
                    <Search size={20} />
                  </button>
                  
                  {/* Compact Location Badge */}
                  <div className="flex items-center space-x-1 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 cursor-pointer group hover:border-primary/30 transition-all">
                      <MapPin size={16} className="text-red-500 group-hover:animate-bounce" />
                      <span className="text-sm font-bold text-dark">Food Stall <span className="text-primary font-extrabold text-lg">{settings.stallNumber}</span></span>
                      <ChevronDown size={14} className="text-gray-400" />
                  </div>

                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-dark cursor-pointer hover:bg-gray-50 relative transition-transform active:scale-95"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F9F4EC]">
                        {cartCount}
                      </span>
                    )}
                  </button>
               </div>
            )}
          </header>

          <main className="px-6 space-y-8 pb-24">
            {!isSearchOpen && (
              <>
                {/* Filter Pills */}
                <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
                  {[
                    { label: 'Self Pickup', icon: '🛍️' },
                    { label: 'Desk Delivery', icon: '🪑' },
                  ].map((filter, idx) => (
                    <button key={idx} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600 whitespace-nowrap hover:shadow-md transition-shadow">
                      <span>{filter.icon}</span>
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>

                {/* Promo Banner - Use the first promo from state */}
                {promotions.length > 0 && (
                     <PromoBanner offer={promotions[0]} />
                )}
              </>
            )}

            {/* Categories Rail */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                <h3 className="font-bold text-lg text-dark">Categories</h3>
              </div>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                <button
                    onClick={() => setSelectedCategory(CategoryType.ALL)}
                    className={`flex flex-col items-center space-y-2 min-w-[70px] transition-transform active:scale-95`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm text-2xl transition-colors ${
                      selectedCategory === CategoryType.ALL ? 'bg-primary border-2 border-primary' : 'bg-white'
                    }`}>
                      🏠
                    </div>
                    <span className={`text-xs font-medium ${selectedCategory === CategoryType.ALL ? 'text-dark font-bold' : 'text-gray-500'}`}>All</span>
                  </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center space-y-2 min-w-[70px] transition-transform active:scale-95`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm text-2xl transition-colors ${
                      selectedCategory === cat.id ? 'bg-primary border-2 border-primary' : 'bg-white hover:bg-gray-50'
                    }`}>
                      {cat.icon}
                    </div>
                    <span className={`text-xs font-medium ${selectedCategory === cat.id ? 'text-dark font-bold' : 'text-gray-500'}`}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Title */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark">
                {searchQuery ? `Search results for "${searchQuery}"` : (selectedCategory === CategoryType.ALL ? 'Popular Items' : `${selectedCategory} Menu`)}
              </h2>
              {!searchQuery && <button className="text-sm text-gray-400 hover:text-dark">See all</button>}
            </div>

            {/* Food List */}
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                        🔍
                    </div>
                    <p>No items found for <span className="font-bold">"{searchQuery}"</span></p>
                    <button 
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory(CategoryType.ALL);
                            if (!isSearchOpen) setIsSearchOpen(true);
                        }} 
                        className="mt-4 text-primary font-bold"
                    >
                        Clear Search
                    </button>
                </div>
              ) : (
                filteredItems.map(item => {
                  const discountPct = activePromo ? activePromo.discountPercentage : 0;
                  const finalPrice = discountPct > 0 ? item.price * (1 - discountPct / 100) : item.price;

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setViewingItem(item)}
                      className="bg-white p-4 rounded-3xl shadow-sm flex space-x-4 animate-fade-in group hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-2xl bg-gray-100" />
                        {item.isPopular && (
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center shadow-sm">
                            <Flame size={10} className="text-orange-500 mr-1" />
                            HOT
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-dark text-lg leading-tight mb-1">{item.name}</h3>
                            <div className="flex items-center space-x-1 bg-yellow-50 px-1.5 py-0.5 rounded-lg">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-bold text-yellow-700">{item.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-400 text-xs mt-1">
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {item.timeEstimate}
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div>{item.calories} Kcal</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end mt-2">
                          <div>
                             {activePromo ? (
                                <div className="flex items-baseline space-x-2">
                                   <span className="text-sm text-gray-400 line-through decoration-gray-400/50">${item.price.toFixed(2)}</span>
                                   <span className="text-xl font-bold text-dark animate-in fade-in zoom-in duration-300">${finalPrice.toFixed(2)}</span>
                                </div>
                             ) : (
                                <span className="text-xl font-bold text-dark">${item.price.toFixed(2)}</span>
                             )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingItem(item);
                            }}
                            className="w-10 h-10 bg-dark rounded-full flex items-center justify-center text-white hover:bg-primary hover:text-dark transition-colors active:scale-90"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </>
      )}

      {/* Profile/Auth View */}
      {activeTab === 'profile' && (
        user ? (
          <ProfileScreen 
            user={user} 
            onLogout={() => setUser(null)} 
            orders={orders}
            onSwitchToAdmin={() => setIsLoginPageOpen(true)}
          />
        ) : (
          <AuthScreen onLogin={(u) => setUser(u)} />
        )
      )}

      {/* Components */}
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} cartCount={cartCount} />
      
      <CartSheet 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        user={user}
        onLogin={setUser}
        onPlaceOrder={addOrder}
        settings={settings}
        activePromo={activePromo}
      />

      <ProductDetailsSheet
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        item={viewingItem}
        onAddToCart={addToCart}
        activePromo={activePromo}
      />

      <AiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onAddToCart={(item) => addToCart(item, 1)}
      />
    </div>
  );
};

export default App;