import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Briefcase, FileText } from 'lucide-react';

interface AccountRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    name: string;
}

export const AccountRequestModal: React.FC<AccountRequestModalProps> = ({ isOpen, onClose, email, name }) => {
    const [department, setDepartment] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSent(true);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#1A2B3C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Request Account Access</h2>
                            <p className="text-white/60 text-sm">
                                The email <span className="text-mint-green">{email}</span> is not part of our organization domain.
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isSent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-mint-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={32} className="text-mint-green" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Request Sent!</h3>
                                <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">
                                    Our admin team will review your request. You will receive an email at {email} once approved.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-sm text-yellow-400/80 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                                    Please provide additional details so we can verify your identity and grant access.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                value={name}
                                                disabled
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white/50 text-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Department</label>
                                        <div className="relative">
                                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                placeholder="e.g. Marketing"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:border-mint-green/50 focus:outline-none transition-colors placeholder-white/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Reason for Access</label>
                                    <div className="relative">
                                        <FileText size={16} className="absolute left-3 top-3 text-white/30" />
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="I need access to report a bug in..."
                                            required
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:border-mint-green/50 focus:outline-none transition-colors placeholder-white/20 resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold py-3 rounded-xl transition-all shadow-lg shadow-mint-green/10 flex items-center justify-center gap-2 mt-2"
                                >
                                    {isSubmitting ? 'Sending Request...' : 'Send Request'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
