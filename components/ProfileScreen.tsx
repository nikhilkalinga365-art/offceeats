import React, { useState } from 'react';
import { User, Order } from '../types';
import { LogOut, MapPin, CreditCard, Bell, ChevronRight, Package, Settings, Heart, Phone, Lock } from 'lucide-react';
import { OrderReceipt } from './OrderReceipt';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
  orders: Order[];
  onSwitchToAdmin: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, orders, onSwitchToAdmin }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const myOrders = orders.filter(o => o.mobileNumber === user.phoneNumber).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen bg-[#F9F4EC] pb-24 animate-fade-in flex flex-col">
      {/* Header Profile Card */}
      <div className="bg-white rounded-b-[2.5rem] px-6 pt-12 pb-8 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-[#F9F4EC] shadow-md bg-gray-100 flex items-center justify-center text-3xl">
             {user.avatarUrl && !user.avatarUrl.includes('ui-avatars') ? (
                 <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover" />
             ) : (
                 <span>👤</span>
             )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-dark">{user.name || 'Guest'}</h2>
            <div className="flex items-center space-x-2 text-gray-500 text-sm font-medium mt-1">
                <Phone size={14} />
                <span>{user.phoneNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 bg-gray-50 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                <Heart size={18} className="text-red-500 fill-red-500" />
                <span className="text-sm font-bold text-dark">Favorites</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gray-50 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings size={18} className="text-gray-600" />
                <span className="text-sm font-bold text-dark">Settings</span>
            </button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="px-6 mt-6">
        <h3 className="font-bold text-lg mb-4 text-dark">Account</h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: MapPin, label: 'Saved Addresses', sub: 'Office Desk 4B' },
            { icon: CreditCard, label: 'Payment Methods', sub: 'Apple Pay' },
            { icon: Bell, label: 'Notifications', sub: 'SMS & Push' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-dark text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-6 mt-6 flex-1">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-dark">Order History</h3>
            {myOrders.length > 0 && <span className="text-xs text-gray-400">{myOrders.length} orders</span>}
        </div>
        
        <div className="space-y-3">
          {myOrders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No orders yet.</p>
            </div>
          ) : (
            myOrders.map((order) => (
                <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-98"
                >
                <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                    }`}>
                    <Package size={20} />
                    </div>
                    <div>
                    <h4 className="font-bold text-dark text-sm truncate max-w-[150px]">
                        {order.items.map(i => i.name).join(', ')}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                        <span>{order.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={order.status === 'Processing' ? 'text-blue-500 font-medium' : 'text-green-500 font-medium'}>
                            {order.status}
                        </span>
                    </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-dark">${order.total.toFixed(2)}</span>
                    <ChevronRight size={14} className="text-gray-300 mt-1" />
                </div>
                </div>
            ))
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 mt-8 mb-4">
        <button 
          onClick={onLogout}
          className="w-full bg-white border border-red-100 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Exit Tracking</span>
        </button>
      </div>

      {/* Admin Link */}
      <div className="px-6 pb-4 flex justify-center">
          <button onClick={onSwitchToAdmin} className="text-xs text-gray-300 hover:text-gray-500 flex items-center gap-1 transition-colors">
              <Lock size={10} />
              Admin Access
          </button>
      </div>

      {/* Receipt Modal */}
      {selectedOrder && (
        <OrderReceipt order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};