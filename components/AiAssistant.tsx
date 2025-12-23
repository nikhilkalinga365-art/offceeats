import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Bot, User, ShoppingBag, ChevronRight } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../constants';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendedItem?: MenuItem;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, onAddToCart }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi there! 👋 I'm Oliver, your support concierge. I can help you find food, check ingredients, or give you special discount codes. How can I help today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsgText = input;
    setInput('');
    
    // Add User Message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      text: m.text
    }));

    try {
      const response = await sendChatMessage(history, userMsgText);
      
      let recommendedItem: MenuItem | undefined = undefined;
      if (response.recommendedItemId) {
        recommendedItem = MENU_ITEMS.find(i => i.id === response.recommendedItemId);
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.reply,
        recommendedItem: recommendedItem
      };

      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Chat Window */}
      <div className="relative w-full sm:max-w-md bg-gray-50 h-[85vh] sm:h-[600px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30">
                <Bot size={24} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-dark text-lg leading-tight">Support Chat</h3>
              <p className="text-xs text-green-600 font-medium">● Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F9F4EC]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2 items-end`}>
                
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm overflow-hidden mb-1">
                  {msg.role === 'user' ? (
                    <User size={16} className="text-gray-600" />
                  ) : (
                    <Bot size={16} className="text-primary" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col space-y-2`}>
                  <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-dark text-white rounded-br-none' 
                      : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Product Card Attachment */}
                  {msg.recommendedItem && (
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100 mt-2 animate-fade-in w-64">
                      <div className="flex space-x-3">
                        <img 
                          src={msg.recommendedItem.imageUrl} 
                          alt={msg.recommendedItem.name} 
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-dark text-sm truncate">{msg.recommendedItem.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{msg.recommendedItem.description}</p>
                          <p className="text-primary font-bold text-sm mt-1">${msg.recommendedItem.price}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                            if (msg.recommendedItem) onAddToCart(msg.recommendedItem);
                        }}
                        className="w-full mt-3 bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-black transition-colors flex items-center justify-center space-x-1"
                      >
                        <ShoppingBag size={12} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
               <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Bot size={16} className="text-primary" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
           {/* Quick Suggestions - Only show if messages length is low for clean look */}
           {messages.length < 3 && (
             <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                {['Any discounts? 🏷️', 'I want something spicy 🌶️', 'Where is my food? 📍'].map(q => (
                  <button 
                    key={q} 
                    onClick={() => {
                        setInput(q);
                        // Optional: auto send
                    }}
                    className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full border border-gray-200 transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
             </div>
           )}

          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-dark placeholder-gray-400"
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-3 rounded-full transition-all ${
                input.trim() && !loading
                  ? 'bg-primary text-dark shadow-md hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
