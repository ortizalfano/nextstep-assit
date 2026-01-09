import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageCircle, Clock, CheckCircle2, AlertTriangle, FileText, Image, ExternalLink, Bug, Sparkles } from 'lucide-react';
import type { User as UserType } from '../../App';

interface TicketDetailProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: number | null;
    userRole: UserType['role'];
    currentUser: UserType;
}

// Mock Comments Data
interface Comment {
    id: number;
    user: string;
    role: string;
    content: string;
    time: string;
    isInternal: boolean;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ isOpen, onClose, ticketId, userRole, currentUser }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, user: 'Alex Manager', role: 'manager', content: 'We are looking into this, thanks for reporting.', time: '2h ago', isInternal: false }
    ]);

    if (!isOpen || !ticketId) return null;

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setComments([...comments, {
            id: Date.now(),
            user: currentUser.name,
            role: currentUser.role,
            content: newComment,
            time: 'Just now',
            isInternal: false
        }]);
        setNewComment('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-[#1A2B3C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Main Content (Left) */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar border-r border-white/5">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 sticky top-0 bg-[#1A2B3C]/95 backdrop-blur z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                        <Bug size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Login page freezing on Safari</h2>
                                        <p className="text-sm text-white/40">Ticket #{ticketId}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="md:hidden text-white/40 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-400/10 text-orange-400 border border-orange-400/20">
                                    In Progress
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                    <AlertTriangle size={12} /> High Priority
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 flex items-center gap-1">
                                    <Clock size={12} /> Daily Frequency
                                </span>
                            </div>
                        </div>

                        {/* Details Body */}
                        <div className="p-6 space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Description</h3>
                                <p className="text-white/80 leading-relaxed">
                                    Every time I try to log in using Safari (v15.2), the page freezes after clicking the submit button. Chrome works fine.
                                </p>
                            </section>

                            <section className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Current Behavior</h3>
                                    <p className="text-white/80 text-sm">Submit button spins forever, no redirect.</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Expected Behavior</h3>
                                    <p className="text-white/80 text-sm">Should redirect to Dashboard immediately.</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Steps to Reproduce</h3>
                                <ol className="list-decimal list-inside space-y-2 text-white/80 text-sm">
                                    <li>Open Safari Browser</li>
                                    <li>Go to login page</li>
                                    <li>Enter credentials</li>
                                    <li>Click 'Sign In'</li>
                                </ol>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Attachments</h3>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3 w-max hover:bg-white/10 cursor-pointer transition-colors">
                                        <Image size={20} className="text-blue-400" />
                                        <span className="text-sm text-white">screenshot_error.png</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Sidebar / Comments (Right) */}
                    <div className="w-full md:w-[350px] bg-[#152332] flex flex-col h-[50vh] md:h-auto">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <MessageCircle size={18} /> Activity
                            </h3>
                            <button onClick={onClose} className="hidden md:block text-white/40 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${comment.role === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white'}`}>
                                        {comment.user.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <span className="text-sm font-medium text-white">{comment.user}</span>
                                            <span className="text-[10px] text-white/40">{comment.time}</span>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-white/80 border border-white/5">
                                            {comment.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comment Input */}
                        <div className="p-4 border-t border-white/5 bg-[#152332]">
                            <form onSubmit={handleSendComment} className="relative">
                                <input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full bg-[#0F1924] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-mint-green text-[#1A2B3C] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
