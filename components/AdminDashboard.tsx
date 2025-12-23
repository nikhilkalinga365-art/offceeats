import React, { useState, useMemo, useRef } from 'react';
import { Order, MenuItem, CategoryType, PromoOffer, RestaurantSettings, Category } from '../types';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Settings, 
  LogOut, 
  DollarSign, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Search,
  Tag,
  Store,
  Truck,
  Upload,
  Calendar,
  Percent,
  Menu,
  X,
  TrendingUp,
  MapPin,
  Layers
} from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  promotions: PromoOffer[];
  settings: RestaurantSettings;
  categories: Category[];
  onUpdateOrderStatus: (orderId: string, status: 'Completed' | 'Processing' | 'Cancelled') => void;
  onUpdateMenu: (items: MenuItem[]) => void;
  onUpdatePromotions: (promos: PromoOffer[]) => void;
  onUpdateSettings: (settings: RestaurantSettings) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  orders, 
  menuItems, 
  promotions,
  settings,
  categories,
  onUpdateOrderStatus, 
  onUpdateMenu, 
  onUpdatePromotions,
  onUpdateSettings,
  onUpdateCategories,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'categories' | 'promotions' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // -- MENU STATE --
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: CategoryType.BURGER,
    imageUrl: '',
    rating: 5.0,
    timeEstimate: '15 min',
    calories: 500
  });

  // -- Category Creation State (Inline) --
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: '', icon: '🍔' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- CATEGORY MANAGEMENT STATE (Tab) --
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🍔' });

  // -- ORDERS STATE --
  const [orderFilter, setOrderFilter] = useState<'All' | 'Processing' | 'Completed' | 'Cancelled'>('All');
  const [orderSearch, setOrderSearch] = useState('');

  // -- PROMO STATE --
  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [newPromo, setNewPromo] = useState<{
      title: string;
      subtitle: string;
      discountPercentage: number;
      imageUrl: string;
      startDate: string;
      endDate: string;
      enableDynamicPricing: boolean;
      priceIncreaseInterval: number;
      priceIncreaseStep: number;
  }>({
      title: '',
      subtitle: '',
      discountPercentage: 0,
      imageUrl: 'https://picsum.photos/800/400',
      startDate: '',
      endDate: '',
      enableDynamicPricing: false,
      priceIncreaseInterval: 10,
      priceIncreaseStep: 5
  });

  const EMOJI_LIBRARY = [
    "🍔", "🍕", "☕", "🍚", "🥗", "🍩", "🌮", "🌭", "🥪", "🍟", 
    "🍝", "🍜", "🥘", "🍣", "🍱", "🍛", "🥣", "🥞", "🧇", "🥩", 
    "🍗", "🍖", "🥙", "🥚", "🍞", "🥐", "🥖", "🥨", "🧀", "🥦", 
    "🥬", "🥒", "🌶️", "🌽", "🥕", "🥔", "🍠", "🥯", "🍳", "🥓", 
    "🌯", "🥫", "🍲", "🥟", "🍤", "🍙", "🍘", "🍦", "🍰", "🎂",
    "🍪", "🍫", "🍬", "🍭", "🥤", "🧋", "🍺", "🍷", "🍹", "🥂"
  ];

  // Calculate Stats
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const activeOrdersCount = orders.filter(o => o.status === 'Processing').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

  // -- MENU HANDLERS --

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
      item.category.toLowerCase().includes(menuSearch.toLowerCase())
    );
  }, [menuItems, menuSearch]);

  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setNewItem({
        name: '',
        description: '',
        price: 0,
        category: categories[0]?.id || CategoryType.BURGER,
        imageUrl: '',
        rating: 5.0,
        timeEstimate: '15 min',
        calories: 500
    });
    setIsCreatingCategory(false);
    setNewCategoryData({ name: '', icon: '🍔' });
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItemId(item.id);
    setNewItem({ ...item });
    setIsCreatingCategory(false);
    setIsItemModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = () => {
    if (!newItem.name || !newItem.price) return;
    
    // Handle new category creation
    let finalCategory = newItem.category;
    if (isCreatingCategory && newCategoryData.name) {
        const newCatId = newCategoryData.name.trim().replace(/\s+/g, '-').toLowerCase();
        
        // Check duplication
        if (!categories.find(c => c.id === newCatId)) {
            const newCategory: Category = {
                id: newCatId,
                name: newCategoryData.name,
                icon: newCategoryData.icon
            };
            onUpdateCategories([...categories, newCategory]);
        }
        finalCategory = newCatId;
    }

    if (editingItemId) {
        // Update existing
        const updatedItems = menuItems.map(item => 
            item.id === editingItemId ? { ...item, ...newItem, category: finalCategory } as MenuItem : item
        );
        onUpdateMenu(updatedItems);
    } else {
        // Add new
        const item: MenuItem = {
            id: Date.now().toString(),
            name: newItem.name!,
            description: newItem.description || '',
            price: Number(newItem.price),
            category: finalCategory || CategoryType.BURGER,
            imageUrl: newItem.imageUrl || 'https://picsum.photos/400/400',
            rating: 5.0,
            calories: Number(newItem.calories) || 0,
            timeEstimate: newItem.timeEstimate || '10 min',
            isPopular: false
        };
        onUpdateMenu([item, ...menuItems]);
    }

    setIsItemModalOpen(false);
    setNewCategoryData({ name: '', icon: '🍔' });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onUpdateMenu(menuItems.filter(i => i.id !== id));
    }
  };

  // -- CATEGORY HANDLERS --
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', icon: EMOJI_LIBRARY[0] });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, icon: cat.icon });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) return;
    
    // Simple ID generation for demo purposes
    const newId = editingCategoryId || categoryForm.name.trim().replace(/\s+/g, '-').toLowerCase();

    const newCategory: Category = {
        id: newId,
        name: categoryForm.name,
        icon: categoryForm.icon
    };

    if (editingCategoryId) {
        const updated = categories.map(c => c.id === editingCategoryId ? newCategory : c);
        onUpdateCategories(updated);
    } else {
        if (categories.some(c => c.id === newId)) {
            alert('Category already exists!');
            return;
        }
        onUpdateCategories([...categories, newCategory]);
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
      if (window.confirm('Are you sure? Items in this category will need reassignment or might not display correctly.')) {
          onUpdateCategories(categories.filter(c => c.id !== id));
      }
  };


  // -- ORDER HANDLERS --

  const filteredOrders = useMemo(() => {
      return orders.filter(order => {
          const matchesFilter = orderFilter === 'All' || order.status === orderFilter;
          const matchesSearch = 
            order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
            order.mobileNumber.includes(orderSearch) ||
            order.seatNumber?.toLowerCase().includes(orderSearch.toLowerCase());
          
          return matchesFilter && matchesSearch;
      });
  }, [orders, orderFilter, orderSearch]);


  // -- PROMO HANDLERS --
  
  // Helper to format Date to YYYY-MM-DDTHH:mm string in local time
  const toLocalISOString = (date: Date) => {
      const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
  };

  const handleOpenAddPromo = () => {
      setEditingPromoId(null);
      // Default: Start now, end in 2 hours
      const now = new Date();
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      setNewPromo({
          title: '',
          subtitle: '',
          discountPercentage: 20,
          imageUrl: 'https://picsum.photos/800/400',
          startDate: toLocalISOString(now),
          endDate: toLocalISOString(end),
          enableDynamicPricing: false,
          priceIncreaseInterval: 10,
          priceIncreaseStep: 5
      });
      setIsAddPromoModalOpen(true);
  };

  const handleEditPromo = (promo: PromoOffer) => {
      setEditingPromoId(promo.id);
      setNewPromo({
          title: promo.title,
          subtitle: promo.subtitle,
          discountPercentage: promo.discountPercentage,
          imageUrl: promo.image,
          startDate: toLocalISOString(promo.startDate),
          endDate: toLocalISOString(promo.expiryDate),
          enableDynamicPricing: promo.enableDynamicPricing || false,
          priceIncreaseInterval: promo.priceIncreaseInterval || 10,
          priceIncreaseStep: promo.priceIncreaseStep || 5
      });
      setIsAddPromoModalOpen(true);
  };

  const handleSavePromo = () => {
      if (!newPromo.title || !newPromo.startDate || !newPromo.endDate) return;

      if (editingPromoId) {
          // Update Existing
          const updatedPromos = promotions.map(p => {
              if (p.id === editingPromoId) {
                  return {
                      ...p,
                      title: newPromo.title,
                      subtitle: newPromo.subtitle,
                      discountPercentage: newPromo.discountPercentage,
                      image: newPromo.imageUrl,
                      startDate: new Date(newPromo.startDate),
                      expiryDate: new Date(newPromo.endDate),
                      enableDynamicPricing: newPromo.enableDynamicPricing,
                      priceIncreaseInterval: newPromo.priceIncreaseInterval,
                      priceIncreaseStep: newPromo.priceIncreaseStep
                  };
              }
              return p;
          });
          onUpdatePromotions(updatedPromos);
      } else {
          // Create New
          const promo: PromoOffer = {
              id: `promo-${Date.now()}`,
              title: newPromo.title,
              subtitle: newPromo.subtitle,
              discountPercentage: newPromo.discountPercentage,
              image: newPromo.imageUrl,
              startDate: new Date(newPromo.startDate),
              expiryDate: new Date(newPromo.endDate),
              enableDynamicPricing: newPromo.enableDynamicPricing,
              priceIncreaseInterval: newPromo.priceIncreaseInterval,
              priceIncreaseStep: newPromo.priceIncreaseStep
          };
          onUpdatePromotions([...promotions, promo]);
      }
      
      setIsAddPromoModalOpen(false);
      setEditingPromoId(null);
  };

  const handleDeletePromo = (id: string) => {
      if (window.confirm('Remove this promotion?')) {
          onUpdatePromotions(promotions.filter(p => p.id !== id));
      }
  };

  const handleTabChange = (tab: any) => {
      setActiveTab(tab);
      setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white flex flex-col transition-transform duration-300 transform md:relative md:translate-x-0 shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <UtensilsCrossed />
            Admin
          </h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => handleTabChange('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <ShoppingBag size={20} />
            <div className="flex justify-between w-full items-center">
                <span>Orders</span>
                {activeOrdersCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{activeOrdersCount}</span>}
            </div>
          </button>
          <button 
            onClick={() => handleTabChange('menu')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <UtensilsCrossed size={20} />
            <span>Menu Items</span>
          </button>
          <button 
            onClick={() => handleTabChange('categories')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Layers size={20} />
            <span>Categories</span>
          </button>
          <button 
            onClick={() => handleTabChange('promotions')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'promotions' ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Tag size={20} />
            <span>Promotions</span>
          </button>
          <button 
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary text-dark font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white p-4 md:p-6 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="md:hidden p-2 -ml-2 text-dark hover:bg-gray-100 rounded-full transition-colors"
             >
                <Menu size={24} />
             </button>
             <h1 className="text-xl md:text-2xl font-bold text-dark capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 hidden sm:flex">
                <span className={`w-2 h-2 rounded-full ${settings.isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{settings.isStoreOpen ? 'Store Open' : 'Store Closed'}</span>
             </div>
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-dark">Admin</p>
             </div>
             <div className="w-10 h-10 bg-dark rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                A
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-bold text-dark">${totalRevenue.toFixed(2)}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Active Orders</p>
                                <h3 className="text-3xl font-bold text-dark">{activeOrdersCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                <Clock size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Completed Orders</p>
                                <h3 className="text-3xl font-bold text-dark">{completedOrdersCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in max-w-4xl">
                     {/* Location Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-primary" />
                            Location Settings
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Stall Number</label>
                            <input 
                                type="text" 
                                value={settings.stallNumber}
                                onChange={(e) => onUpdateSettings({ ...settings, stallNumber: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary font-bold text-dark"
                                placeholder="e.g. 6"
                            />
                            <p className="text-xs text-gray-400 mt-1">This number is displayed in the app header.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                            <Store size={20} className="text-primary" />
                            Store Status
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-dark">Open / Close Store</p>
                                    <p className="text-sm text-gray-500">Disable all ordering immediately</p>
                                </div>
                                <button 
                                    onClick={() => onUpdateSettings({ ...settings, isStoreOpen: !settings.isStoreOpen })}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.isStoreOpen ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.isStoreOpen ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-dark">Enable Desk Delivery</p>
                                    <p className="text-sm text-gray-500">Allow users to select seat delivery</p>
                                </div>
                                <button 
                                    onClick={() => onUpdateSettings({ ...settings, isDeskDeliveryEnabled: !settings.isDeskDeliveryEnabled })}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.isDeskDeliveryEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.isDeskDeliveryEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                            <Truck size={20} className="text-primary" />
                            Delivery Schedule
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Hour (24h)</label>
                                <input 
                                    type="number" 
                                    min="0" max="23"
                                    value={settings.deliveryStartHour}
                                    onChange={(e) => onUpdateSettings({ ...settings, deliveryStartHour: parseInt(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                                />
                                <p className="text-xs text-gray-400 mt-1">e.g. 11 for 11:00 AM</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">End Hour (24h)</label>
                                <input 
                                    type="number" 
                                    min="0" max="23"
                                    value={settings.deliveryEndHour}
                                    onChange={(e) => onUpdateSettings({ ...settings, deliveryEndHour: parseInt(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                                />
                                <p className="text-xs text-gray-400 mt-1">e.g. 15 for 3:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
                <div className="space-y-6 animate-fade-in">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold text-dark">Category Management</h3>
                         <button 
                            onClick={handleOpenAddCategory}
                            className="bg-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-black transition-colors"
                        >
                            <Plus size={18} />
                            <span>Add Category</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark">{cat.name}</h4>
                                        <p className="text-xs text-gray-400">ID: {cat.id}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEditCategory(cat)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        {/* Filters */}
                        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
                            {['All', 'Processing', 'Completed', 'Cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setOrderFilter(status as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors whitespace-nowrap ${
                                        orderFilter === status 
                                            ? 'bg-dark text-white border-dark' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {status} {status === 'Processing' && activeOrdersCount > 0 && `(${activeOrdersCount})`}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Search ID, Mobile, Seat..."
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <ShoppingBag size={24} />
                                </div>
                                <p>No orders found matching your criteria.</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-mono font-bold text-lg text-dark">{order.id}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                            <span className="text-xs text-gray-400">{order.date.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                                            <div className="flex items-center space-x-1">
                                                <Users size={14} />
                                                <span className="font-bold">{order.mobileNumber}</span>
                                            </div>
                                            {order.deliveryMethod === 'desk' && (
                                                <div className="flex items-center space-x-1 bg-orange-50 px-2 py-0.5 rounded-md text-orange-600 border border-orange-100">
                                                    <Truck size={14} />
                                                    <span className="font-bold">Seat: {order.seatNumber}</span>
                                                </div>
                                            )}
                                            {order.deliveryMethod === 'pickup' && (
                                                <div className="flex items-center space-x-1 bg-purple-50 px-2 py-0.5 rounded-md text-purple-600 border border-purple-100">
                                                    <ShoppingBag size={14} />
                                                    <span className="font-bold">Self Pickup</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between w-full lg:w-auto gap-4 mt-2 lg:mt-0">
                                        <div className="text-left lg:text-right lg:mr-4">
                                            <p className="text-xs text-gray-400 font-medium">TOTAL</p>
                                            <p className="text-xl font-bold text-dark">${order.total.toFixed(2)}</p>
                                        </div>
                                        
                                        {order.status === 'Processing' && (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                                                    className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                                    title="Mark Completed"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                                                    className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 transition-colors"
                                                    title="Cancel Order"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        )}
                                        {order.status === 'Completed' && (
                                            <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-400 font-bold text-sm">
                                                Archived
                                            </div>
                                        )}
                                        {order.status === 'Cancelled' && (
                                            <div className="px-4 py-2 bg-red-50 rounded-xl text-red-400 font-bold text-sm">
                                                Cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
               <div className="animate-fade-in">
                   <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                       <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Search menu..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                       </div>
                       <button 
                           onClick={handleOpenAddModal}
                           className="bg-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-black transition-colors w-full md:w-auto justify-center"
                       >
                           <Plus size={18} />
                           <span>Add Item</span>
                       </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {filteredMenu.map(item => (
                           <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
                               <div className="relative h-48 overflow-hidden">
                                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                   <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                           onClick={() => handleOpenEditModal(item)}
                                           className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-dark hover:text-primary shadow-sm"
                                       >
                                           <Edit2 size={16} />
                                       </button>
                                       <button 
                                           onClick={() => handleDeleteItem(item.id)}
                                           className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 shadow-sm"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                                   <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-dark shadow-sm">
                                       {item.category}
                                   </div>
                               </div>
                               <div className="p-4 flex-1 flex flex-col">
                                   <div className="flex justify-between items-start mb-2">
                                       <h3 className="font-bold text-dark text-lg leading-tight">{item.name}</h3>
                                       <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                                   </div>
                                   <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                                   <div className="flex items-center space-x-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
                                       <span className="flex items-center"><Clock size={12} className="mr-1" /> {item.timeEstimate}</span>
                                       <span className="flex items-center"><TrendingUp size={12} className="mr-1" /> {item.calories} Kcal</span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            )}

            {/* PROMOTIONS TAB */}
            {activeTab === 'promotions' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold text-dark">Active Promotions</h3>
                         <button 
                            onClick={handleOpenAddPromo}
                            className="bg-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-black transition-colors"
                        >
                            <Plus size={18} />
                            <span>Add Offer</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {promotions.map(promo => {
                            const now = new Date();
                            const isExpired = new Date(promo.expiryDate) < now;
                            const isActive = new Date(promo.startDate) <= now && !isExpired;
                            const isUpcoming = new Date(promo.startDate) > now;
                            
                            // Check for dynamic pricing active status (expired but dynamic pricing on)
                            const isDynamicActive = isExpired && promo.enableDynamicPricing;
                            
                            let statusBadge = null;
                            if (isActive) statusBadge = <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg shadow-sm">Active</span>;
                            else if (isUpcoming) statusBadge = <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-sm">Upcoming</span>;
                            else if (isDynamicActive) statusBadge = <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm animate-pulse">Dynamic Pricing</span>;
                            else statusBadge = <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-lg shadow-sm">Expired</span>;

                            return (
                                <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="h-40 relative group">
                                        <img src={promo.image} alt={promo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute top-2 right-2 flex space-x-2">
                                            <button 
                                                onClick={() => handleEditPromo(promo)}
                                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-dark hover:text-primary shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePromo(promo.id)}
                                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 flex space-x-2">
                                            {statusBadge}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-primary/20 text-dark px-2 py-0.5 rounded text-xs font-bold border border-primary/20">
                                                {promo.discountPercentage}% OFF
                                            </span>
                                            <div className="flex flex-col items-end text-xs text-gray-400">
                                                <span className="flex items-center">
                                                    Start: {promo.startDate.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                                <span className="flex items-center">
                                                    End: {promo.expiryDate.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg text-dark mb-1">{promo.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{promo.subtitle}</p>
                                        
                                        {promo.enableDynamicPricing && (
                                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-500 border border-gray-100 flex items-start gap-2">
                                                <TrendingUp size={14} className="mt-0.5 text-orange-500" />
                                                <span>Price increases by reducing discount {promo.priceIncreaseStep}% every {promo.priceIncreaseInterval} min after end time.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {isItemModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsItemModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl animate-fade-in-up">
                  <h2 className="text-xl font-bold mb-4">{editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                  <div className="space-y-4">
                      {/* Image Upload */}
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item Image</label>
                          <div className="flex items-start space-x-4">
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary cursor-pointer transition-colors overflow-hidden shrink-0"
                              >
                                  {newItem.imageUrl ? (
                                    <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <>
                                        <Upload size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold">Upload</span>
                                    </>
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                  />
                                  <input 
                                    type="text"
                                    placeholder="Or paste image URL..."
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
                                    value={newItem.imageUrl}
                                    onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                                  />
                                  <p className="text-xs text-gray-400 mt-2">
                                      Supported formats: JPG, PNG. Max 5MB.
                                  </p>
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                            value={newItem.name}
                            onChange={e => setNewItem({...newItem, name: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ($)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                                value={newItem.price}
                                onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                                Category
                                {isCreatingCategory && (
                                    <button 
                                        onClick={() => setIsCreatingCategory(false)} 
                                        className="text-primary hover:underline text-[10px]"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </label>
                            
                            {!isCreatingCategory ? (
                                <select 
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary appearance-none"
                                    value={newItem.category}
                                    onChange={e => {
                                        if (e.target.value === 'NEW_CATEGORY') {
                                            setIsCreatingCategory(true);
                                        } else {
                                            setNewItem({...newItem, category: e.target.value as any});
                                        }
                                    }}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                    <option value="NEW_CATEGORY" className="font-bold text-primary">+ Create New Category</option>
                                </select>
                            ) : (
                                <div className="space-y-2 animate-fade-in bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2 absolute z-10 w-64 shadow-xl right-0 md:right-auto md:relative md:w-full">
                                    <input 
                                        type="text"
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        placeholder="Category Name"
                                        autoFocus
                                        value={newCategoryData.name}
                                        onChange={e => setNewCategoryData({...newCategoryData, name: e.target.value})}
                                    />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Select Icon</p>
                                        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                                            {EMOJI_LIBRARY.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => setNewCategoryData({...newCategoryData, icon: emoji})}
                                                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-lg transition-colors ${newCategoryData.icon === emoji ? 'bg-primary border border-primary text-dark shadow-sm' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                          <textarea 
                             className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                             rows={3}
                             value={newItem.description}
                             onChange={e => setNewItem({...newItem, description: e.target.value})}
                          ></textarea>
                      </div>

                      <button 
                        onClick={handleSaveItem}
                        className="w-full bg-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center space-x-2"
                      >
                          {editingItemId ? 'Update Item' : 'Add Item'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Add/Edit Category Modal */}
      {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in-up">
                  <h2 className="text-xl font-bold mb-4">{editingCategoryId ? 'Edit Category' : 'New Category'}</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary font-bold text-dark"
                            value={categoryForm.name}
                            onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                            placeholder="e.g. Burgers"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Icon</label>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-64 overflow-y-auto grid grid-cols-5 gap-2">
                             {EMOJI_LIBRARY.map(emoji => (
                                 <button
                                    key={emoji}
                                    onClick={() => setCategoryForm({...categoryForm, icon: emoji})}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${
                                        categoryForm.icon === emoji 
                                        ? 'bg-primary text-dark shadow-md scale-110' 
                                        : 'bg-white hover:bg-gray-200 text-gray-600'
                                    }`}
                                 >
                                     {emoji}
                                 </button>
                             ))}
                          </div>
                      </div>

                      <button 
                        onClick={handleSaveCategory}
                        disabled={!categoryForm.name}
                        className="w-full bg-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                      >
                          {editingCategoryId ? 'Update Category' : 'Create Category'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Add/Edit Promo Modal */}
      {isAddPromoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddPromoModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">{editingPromoId ? 'Edit Promotion' : 'Create Promotion'}</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Campaign Title</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                            value={newPromo.title}
                            placeholder="e.g. Happy Hour Special"
                            onChange={e => setNewPromo({...newPromo, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                            value={newPromo.subtitle}
                            placeholder="e.g. 20% off all orders"
                            onChange={e => setNewPromo({...newPromo, subtitle: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                            <input 
                                type="datetime-local" 
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs"
                                value={newPromo.startDate}
                                onChange={e => setNewPromo({...newPromo, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                            <input 
                                type="datetime-local" 
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs"
                                value={newPromo.endDate}
                                onChange={e => setNewPromo({...newPromo, endDate: e.target.value})}
                            />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Discount Percentage (%)</label>
                        <div className="relative">
                            <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="number" 
                                min="1" max="100"
                                className="w-full pl-11 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                                value={newPromo.discountPercentage}
                                onChange={e => setNewPromo({...newPromo, discountPercentage: Number(e.target.value)})}
                            />
                        </div>
                      </div>

                      {/* Dynamic Pricing Section */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                  <TrendingUp size={18} className="text-orange-500" />
                                  <span className="font-bold text-sm text-dark">Dynamic Post-Campaign Pricing</span>
                              </div>
                              <button 
                                  onClick={() => setNewPromo({...newPromo, enableDynamicPricing: !newPromo.enableDynamicPricing})}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newPromo.enableDynamicPricing ? 'bg-orange-500' : 'bg-gray-300'}`}
                              >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newPromo.enableDynamicPricing ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                          </div>
                          
                          {newPromo.enableDynamicPricing && (
                              <div className="space-y-3 animate-fade-in">
                                  <p className="text-xs text-gray-500 mb-2">After the campaign ends, increase the price (by lowering discount) automatically.</p>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Increase Interval (min)</label>
                                          <input 
                                              type="number" 
                                              min="1"
                                              className="w-full p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                                              value={newPromo.priceIncreaseInterval}
                                              onChange={e => setNewPromo({...newPromo, priceIncreaseInterval: Number(e.target.value)})}
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reduce Discount By (%)</label>
                                          <input 
                                              type="number" 
                                              min="1" max="100"
                                              className="w-full p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                                              value={newPromo.priceIncreaseStep}
                                              onChange={e => setNewPromo({...newPromo, priceIncreaseStep: Number(e.target.value)})}
                                          />
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      <button 
                        onClick={handleSavePromo}
                        className="w-full bg-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                      >
                          {editingPromoId ? 'Update Campaign' : 'Schedule Campaign'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};