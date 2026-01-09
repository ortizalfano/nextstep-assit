import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Sparkles } from 'lucide-react';

interface Step0Props {
    onSelect: (type: 'bug' | 'feature') => void;
    compact?: boolean;
}

export const Step0TypeSelection: React.FC<Step0Props> = ({ onSelect, compact = false }) => {
    if (compact) {
        return (
            <div className="w-full flex justify-end gap-3 mb-2">
                <button
                    onClick={() => onSelect('bug')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
                >
                    <Bug size={16} />
                    <span>Report Issue</span>
                </button>

                <button
                    onClick={() => onSelect('feature')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-400/10 hover:bg-orange-400/20 text-orange-400 border border-orange-400/20 rounded-lg text-sm transition-colors"
                >
                    <Sparkles size={16} />
                    <span>Request Feature</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-white mb-2">How can we help today?</h2>
                <p className="text-white/60">Choose the option that best describes your needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Report Bug */}
                <motion.button
                    onClick={() => onSelect('bug')}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative h-64 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300 hover:bg-white/10 hover:border-red-400/30 hover:shadow-2xl hover:shadow-red-500/10"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 p-[1px] shadow-lg transform transition-transform group-hover:rotate-6 duration-500">
                        <div className="w-full h-full bg-[#1A2B3C] rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 opacity-20" />
                            <Bug size={40} className="text-white relative z-10" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-medium text-white mb-1">Report an Issue</h3>
                        <p className="text-white/60 text-sm">Something isn't working as expected.</p>
                    </div>
                </motion.button>

                {/* Feature Request */}
                <motion.button
                    onClick={() => onSelect('feature')}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative h-64 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300 hover:bg-white/10 hover:border-yellow-400/30 hover:shadow-2xl hover:shadow-yellow-500/10"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-[1px] shadow-lg transform transition-transform group-hover:-rotate-6 duration-500">
                        <div className="w-full h-full bg-[#1A2B3C] rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20" />
                            <Sparkles size={40} className="text-white relative z-10" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-medium text-white mb-1">Request Feature</h3>
                        <p className="text-white/60 text-sm">I have an idea to improve Collect!</p>
                    </div>
                </motion.button>
            </div>
        </div>
    );
};
