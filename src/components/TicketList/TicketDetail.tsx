import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Clock, AlertTriangle, Image as ImageIcon, Bug, Sparkles } from 'lucide-react';
import type { User as UserType } from '../../App';
import { api } from '../../lib/api';

interface TicketDetailProps {
    isOpen: boolean;
    ticket: any; // We pass full ticket object now
    onClose: () => void;
    currentUser: UserType;
}

interface Comment {
    id: number;
    user: string;
    role: string;
    content: string;
    time: string;
    isInternal: boolean;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ isOpen, onClose, ticket, currentUser }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        if (isOpen && ticket) {
            setLoadingComments(true);
            api.tickets.comments.list(ticket.id.toString())
                .then((data: any[]) => {
                    // Map API comments to UI format
                    const formattedComments = data.map(c => ({
                        id: c.id,
                        user: c.user_name || 'Unknown',
                        role: c.user_role || 'user',
                        content: c.content,
                        time: new Date(c.created_at).toLocaleString(), // Simple formatting
                        isInternal: false
                    }));
                    setComments(formattedComments);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingComments(false));
        }
    }, [isOpen, ticket]);

    if (!isOpen || !ticket) return null;

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.tickets.comments.create(ticket.id.toString(), newComment, currentUser.id.toString());

            // Refetch or optimistically add
            setComments([...comments, {
                id: Date.now(),
                user: currentUser.name,
                role: currentUser.role,
                content: newComment,
                time: 'Just now',
                isInternal: false
            }]);
            setNewComment('');
        } catch (err) {
            console.error("Failed to post comment", err);
        }
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
                                    <div className={`p-2 rounded-lg border flex items-center justify-center ${ticket.type === 'bug' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                        {ticket.type === 'bug' ? <Bug size={20} /> : <Sparkles size={20} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{ticket.subject}</h2>
                                        <p className="text-sm text-white/40">Ticket #{ticket.id} • via {ticket.created_by_name || 'Unknown'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="md:hidden text-white/40 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${ticket.status === 'new' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                                        ticket.status === 'in_progress' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                                            'bg-mint-green/10 text-mint-green border-mint-green/20'
                                    }`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 capitalize ${ticket.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        ticket.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            'bg-white/5 text-white/60 border-white/10'
                                    }`}>
                                    <AlertTriangle size={12} /> {ticket.priority} Priority
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 flex items-center gap-1">
                                    <Clock size={12} /> {ticket.created_at}
                                </span>
                            </div>
                        </div>

                        {/* Details Body */}
                        <div className="p-6 space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Description</h3>
                                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                                    {ticket.description || 'No description provided.'}
                                </p>
                            </section>

                            {/* Dynamic sections based on ticket data (simplification: assume JSONB fields are parsed or available) */}
                            {/* For now, just show description as main content */}

                            {ticket.steps_to_reproduce && (
                                <section>
                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Steps to Reproduce</h3>
                                    <div className="text-white/80 text-sm whitespace-pre-wrap">
                                        {/* Since steps_to_reproduce is likely String or JSON in DB, we display it safely */}
                                        {typeof ticket.steps_to_reproduce === 'string' ? ticket.steps_to_reproduce : JSON.stringify(ticket.steps_to_reproduce, null, 2)}
                                    </div>
                                </section>
                            )}

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
                            {loadingComments ? (
                                <p className="text-white/40 text-center text-sm py-4">Loading comments...</p>
                            ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${comment.role === 'manager' || comment.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white'}`}>
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
                                ))
                            ) : (
                                <p className="text-white/20 text-center text-sm py-8">No activity yet. Be the first to comment.</p>
                            )}
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
