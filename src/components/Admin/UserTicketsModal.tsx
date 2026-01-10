import React, { useEffect, useState } from 'react';
import { X, Loader, AlertCircle, FileText, Calendar } from 'lucide-react';
import { api } from '../../lib/api';

interface UserTicketsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { id: number; name: string } | null;
}

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    type: string;
}

export const UserTicketsModal: React.FC<UserTicketsModalProps> = ({ isOpen, onClose, user }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            loadTickets();
        }
    }, [isOpen, user]);

    const loadTickets = async () => {
        if (!user) return;
        setIsLoading(true);
        setError('');
        try {
            // Fetch tickets using admin perms but filtering by this specific user ID
            const data = await api.tickets.list('admin', '0', user.id.toString());
            setTickets(data);
        } catch (err) {
            setError('Failed to load user history');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-white/5 text-white/60 border-white/10';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#1A2B3C] border border-white/10 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex-none p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Ticket History</h2>
                        <p className="text-white/40 text-sm">Created by {user.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-white/40">
                            <Loader className="animate-spin mb-2" />
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-red-400">
                            <AlertCircle size={32} className="mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p>No tickets found for this user.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ticket.type === 'bug' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {ticket.type}
                                            </span>
                                            <h3 className="text-white font-medium">{ticket.subject}</h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 uppercase">
                                            <AlertCircle size={12} />
                                            {ticket.priority} Priority
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
