import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart3, Lock, AlertOctagon } from 'lucide-react';

interface Step1Props {
    onSelect: (category: string) => void;
}

const categories = [
    { id: 'data_sync', label: 'Data Sync Issues', icon: Database, color: 'from-blue-400 to-blue-600' },
    { id: 'reporting', label: 'Reporting & Analytics', icon: BarChart3, color: 'from-purple-400 to-purple-600' },
    { id: 'access', label: 'Account Access', icon: Lock, color: 'from-emerald-400 to-emerald-600' },
    { id: 'crash', label: 'System Crashes', icon: AlertOctagon, color: 'from-red-400 to-red-600' },
];

export const Step1Discovery: React.FC<Step1Props> = ({ onSelect }) => {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-white mb-2">What seems to be the challenge?</h2>
                <p className="text-white/60">Select the area where you're experiencing issues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-48 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-mint-green/5"
                    >
                        {/* 3D Icon Container */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} p-[1px] shadow-lg transform transition-transform group-hover:rotate-6 duration-500`}>
                            <div className="w-full h-full bg-[#1A2B3C] rounded-2xl flex items-center justify-center overflow-hidden relative">
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20`} />
                                <cat.icon size={32} className="text-white relative z-10" />
                            </div>
                        </div>

                        <span className="text-white font-medium text-lg text-center">{cat.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
