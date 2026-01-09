import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, Paperclip, Minimize2 } from 'lucide-react';
import { api } from '../../lib/api';

interface ChatWidgetProps {
    userRole: 'admin' | 'manager' | 'user';
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ userRole }) => {
    const [isOpen, setIsOpen] = useState(false); // Only for Admin/Manager floating mode
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi there! I'm Nexty, your AI assistant powered by Gemini. How can I help you today?", sender: 'bot', timestamp: 'Just now' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isProminent = userRole === 'user';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const newUserMsg: Message = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: 'Now'
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Get history formatted for Gemini (basic)
            const history = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: m.text
            }));

            // Call API
            const response = await api.chat.send(userText, history);

            const botMsg: Message = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'bot',
                timestamp: 'Now'
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.warn("AI API unreachable, using mock.", error);
            // Mock AI Response Fallback
            setTimeout(() => {
                const botMsg: Message = {
                    id: Date.now() + 1,
                    text: "I'm having trouble connecting to my brain server (API), but once deployed I'll be fully operational!",
                    sender: 'bot',
                    timestamp: 'Now'
                };
                setMessages(prev => [...prev, botMsg]);
            }, 1000);
        } finally {
            setIsTyping(false);
        }
    };

    // --- RENDER LOGIC ---

    const ChatContent = () => (
        <div className="flex flex-col h-full bg-[#152332] overflow-hidden">
            {/* Header */}
            <div className={`flex-none p-4 border-b border-white/5 bg-[#1A2B3C]/95 backdrop-blur z-10 flex items-center justify-between ${isProminent ? 'rounded-t-none' : 'rounded-t-2xl'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white leading-tight">Nexty</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-mint-green animate-pulse" />
                            <p className="text-xs text-white/40">Online</p>
                        </div>
                    </div>
                </div>
                {!isProminent && (
                    <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                        <Minimize2 size={18} />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === 'user'
                                ? 'bg-indigo-500 text-white rounded-br-none'
                                : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-bl-none p-3 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 border-t border-white/5 bg-[#1A2B3C]/50">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="w-full bg-[#0F1924] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                            type="button"
                            className="p-1.5 text-white/30 hover:text-white transition-colors"
                        >
                            <Paperclip size={16} />
                        </button>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="p-1.5 bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-white/20 flex items-center justify-center gap-1">
                        <Sparkles size={10} /> Powered by Gemini AI
                    </p>
                </div>
            </div>
        </div>
    );

    // PROMINENT MODE (USER)
    if (isProminent) {
        return (
            <div className="w-[380px] h-full flex-none border-l border-white/5 bg-[#1A2B3C]/30 backdrop-blur-xl hidden lg:flex flex-col shadow-2xl z-40">
                <ChatContent />
            </div>
        );
    }

    // FLOATING MODE (ADMIN/MANAGER)
    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-8 w-[380px] h-[600px] max-h-[80vh] bg-[#1A2B3C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col"
                    >
                        <ChatContent />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl z-[100] transition-colors flex items-center justify-center ${isOpen ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" />}
            </motion.button>
        </>
    );
};
