import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreHorizontal, Sparkles, Bug, Loader2 } from 'lucide-react';
import type { User } from '../../App';
import { TicketDetail } from './TicketDetail';
import { api } from '../../lib/api';

interface Ticket {
    id: number;
    type: 'bug' | 'feature';
    subject: string;
    status: 'new' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    created_by_name: string;
}

interface TicketListProps {
    user: User;
}

export const TicketList: React.FC<TicketListProps> = ({ user }) => {
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // api.tickets.list handles optional params. If user is admin/manager, it sends role.
                // If regular user, it sends role + id for filtering.
                // Actually my api signature is list(role, userId).
                const data = await api.tickets.list(user.role, user.id.toString());
                setTickets(data);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [user.role, user.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'in_progress': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'resolved': return 'text-mint-green bg-mint-green/10 border-mint-green/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            default: return 'text-blue-300';
        }
    };

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    return (
        <>
            <div className="w-full mt-2 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {user.role === 'user' ? 'My Tickets' : 'All Updates'}
                    </h3>
                    <button className="text-sm text-mint-green hover:text-white transition-colors">
                        View Archive
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-white/40" size={32} />
                    </div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider backdrop-blur-sm bg-white/5">
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Subject</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Priority</th>
                                        <th className="px-6 py-4 font-medium">Created By</th>
                                        <th className="px-6 py-4 font-medium">Created</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {tickets.map((ticket, index) => (
                                        <motion.tr
                                            key={ticket.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${ticket.type === 'bug' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                                                    {ticket.type === 'bug' ? <Bug size={16} /> : <Sparkles size={16} />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-white">{ticket.subject}</p>
                                                <p className="text-xs text-white/40">#{ticket.id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} capitalize`}>
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full bg-current ${getPriorityColor(ticket.priority)}`} />
                                                    <span className="text-sm text-white/60 capitalize">{ticket.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {ticket.created_by_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/40">
                                                {ticket.created_at}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Empty State */}
                        {tickets.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="mx-auto text-white/20 mb-3" size={48} />
                                <p className="text-white/40">No tickets found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <TicketDetail
                isOpen={!!selectedTicketId}
                ticket={selectedTicket}
                onClose={() => setSelectedTicketId(null)}
                currentUser={user}
            />
        </>
    );
};
