import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle2, Clock, Ticket, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    color: string;
    trend: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={80} />
        </div>

        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-white/10`}>
                <Icon size={24} className="text-white" />
            </div>

            <h3 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white mb-2">{value}</p>

            <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-mint-green' : 'text-red-400'}`}>
                {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1 rotate-180" />}
                {change} <span className="text-white/30 ml-1">vs last week</span>
            </div>
        </div>
    </motion.div>
);

const UserStatRow = ({ name, tickets, avatar }: { name: string, tickets: number, avatar: string }) => (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {/* Simplified avatar for now, could be image if provided */}
                {name.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-white/40">{tickets} tickets reported</p>
            </div>
        </div>
        <div className="w-full max-w-[80px] h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(tickets * 10, 100)}%` }} />
        </div>
    </div>
);

export const AdminStats = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.admin.stats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center py-12">
                <Loader2 className="animate-spin text-white/40" size={32} />
            </div>
        );
    }

    if (!stats) return null;

    // Helper to calculate percentage for breakdown bars
    const total = stats.kpi.totalTickets || 1; // avoid division by zero
    const getPercentage = (count: number) => Math.round((count / total) * 100);

    return (
        <div className="w-full space-y-8 mt-8 mb-12">
            {/* Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Tickets"
                    value={stats.kpi.totalTickets}
                    change="+0%" // We don't have historical data DB yet
                    icon={Ticket}
                    color="text-blue-400"
                    trend="up"
                />
                <MetricCard
                    title="Open Issues"
                    value={stats.kpi.activeTickets}
                    change="0%"
                    icon={Clock}
                    color="text-orange-400"
                    trend="down"
                />
                <MetricCard
                    title="Critical"
                    value={stats.kpi.criticalTickets}
                    change="0"
                    icon={AlertTriangle}
                    color="text-red-400"
                    trend="up"
                />
                <MetricCard
                    title="Resolved"
                    value={stats.kpi.resolvedTickets}
                    change="0%"
                    icon={CheckCircle2}
                    color="text-mint-green"
                    trend="up"
                />
            </div>

            {/* Detailed Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Reporters */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-purple-400" /> Top Reporters
                        </h3>
                        <button className="text-xs text-white/40 hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="space-y-2">
                        {stats.topReporters.map((reporter: any, i: number) => (
                            <UserStatRow key={i} name={reporter.name} tickets={reporter.count} avatar={reporter.avatar} />
                        ))}
                        {stats.topReporters.length === 0 && <p className="text-white/40 text-sm">No reporters yet.</p>}
                    </div>
                </div>

                {/* Urgency Breakdown */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                        <BarChart3 size={20} className="text-blue-400" /> Breakdown
                    </h3>

                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {/* Custom "Chart" bars - Using urgencyData from API */}
                        {stats.urgencyData.map((item: any) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex justify-between text-xs text-white/60 mb-1">
                                    <span>{item.name} ({getPercentage(item.value)}%)</span>
                                    <span>{item.value}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getPercentage(item.value)}%` }}
                                        className="h-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
