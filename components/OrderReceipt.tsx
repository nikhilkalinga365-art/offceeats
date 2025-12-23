import React from 'react';
import { Order } from '../types';
import { CheckCircle, Phone, Armchair, ShoppingBag, User as UserIcon } from 'lucide-react';

interface OrderReceiptProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-green-500 p-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-50 pattern-grid"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 mb-3 shadow-lg">
                        <CheckCircle size={32} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold">Order Confirmed!</h2>
                    <p className="text-green-100 font-medium mt-1">Thank you for your order</p>
                </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 bg-[#F9F4EC] max-h-[70vh] overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Order Info */}
                    <div className="p-4 border-b border-dashed border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                            <p className="text-dark font-bold font-mono">{order.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Time</p>
                            <p className="text-dark font-medium text-sm">
                                {order.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex space-x-2">
                                    <span className="font-bold text-gray-400">{item.quantity}x</span>
                                    <span className="text-dark font-medium">{item.name}</span>
                                </div>
                                <span className="text-gray-600 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-gray-50 border-t border-dashed border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-500 text-sm">Subtotal</span>
                            <span className="font-medium text-gray-700">${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-dark mt-2">
                            <span>Total Amount</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery & Payment Info */}
                <div className="mt-4 space-y-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                {order.deliveryMethod === 'pickup' ? <UserIcon size={18} /> : <Phone size={18} />}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">
                                    {order.deliveryMethod === 'pickup' ? 'Employee Name' : 'Mobile Number'}
                                </p>
                                <p className="font-bold text-dark">{order.mobileNumber}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                order.deliveryMethod === 'desk' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'
                            }`}>
                                {order.deliveryMethod === 'desk' ? <Armchair size={18} /> : <ShoppingBag size={18} />}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">
                                    {order.deliveryMethod === 'desk' ? 'Desk Delivery' : 'Self Pickup'}
                                </p>
                                <p className="font-bold text-dark">
                                    {order.deliveryMethod === 'desk' ? order.seatNumber : 'At Counter'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-6 p-3 rounded-xl text-center font-bold text-sm border ${
                    order.deliveryMethod === 'desk' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                    {order.deliveryMethod === 'desk' ? '💵 Pay at Delivery' : '💵 Pay at Counter'}
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-4 bg-dark text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all active:scale-95"
                >
                    Done
                </button>
            </div>
        </div>
    </div>
  );
};