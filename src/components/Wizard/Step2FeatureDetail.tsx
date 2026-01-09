import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, AlertCircle, Lightbulb, Target, TrendingUp } from 'lucide-react';

interface Step2FeatureProps {
    onNext: (data: any) => void;
    onBack: () => void;
    data: any;
}

const businessValues = [
    'Efficiency / Time Saving',
    'Compliance / Legal',
    'User Experience / Ease of Use',
    'Reporting / Data Quality',
    'Security / Access Control'
];

export const Step2FeatureDetail: React.FC<Step2FeatureProps> = ({ onNext, onBack, data }) => {
    const [formData, setFormData] = useState({
        subject: data.subject || '',
        businessValue: data.businessValue || '',
        priority: data.priority || 50,
        problemStatement: data.problemStatement || '',
        proposedSolution: data.proposedSolution || '',
    });
    const [errors, setErrors] = useState<any>({});

    const validate = () => {
        const newErrors: any = {};
        if (!formData.subject.trim()) newErrors.subject = 'Feature title is required';
        if (!formData.businessValue) newErrors.businessValue = 'Select a primary value';
        if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Please describe the problem';
        if (!formData.proposedSolution.trim()) newErrors.proposedSolution = 'Please describe your idea';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext(formData);
        }
    };

    const getPriorityLabel = (val: number) => {
        if (val < 33) return 'Nice to Have';
        if (val < 66) return 'Important';
        return 'Critical';
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">Share your idea</h2>
                <p className="text-white/60">Help us understand the "Why" and the "What".</p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
            >
                <div className="space-y-8">
                    {/* Row 1: Title & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Feature Title</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="e.g., Bulk Action for Debtor Notes"
                                className={`w-full bg-black/20 border ${errors.subject ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all`}
                            />
                            {errors.subject && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.subject}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Business Value</label>
                            <select
                                value={formData.businessValue}
                                onChange={(e) => setFormData({ ...formData, businessValue: e.target.value })}
                                className={`w-full bg-black/20 border ${errors.businessValue ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all`}
                            >
                                <option value="" className="bg-[#1A2B3C]">Select primary impact...</option>
                                {businessValues.map(v => <option key={v} value={v} className="bg-[#1A2B3C]">{v}</option>)}
                            </select>
                            {errors.businessValue && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.businessValue}</p>}
                        </div>
                    </div>

                    {/* Row 2: Priority */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-sm font-medium text-white/80">Priority / Urgency</label>
                            <span className="text-yellow-400 font-bold text-sm">{getPriorityLabel(formData.priority)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                        />
                    </div>

                    {/* Row 3: Problem & Solution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                                <Target size={16} className="text-red-400" /> Problem Statement (The Why)
                            </label>
                            <textarea
                                value={formData.problemStatement}
                                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                                placeholder="What problem are you trying to solve? e.g. It takes too many clicks to..."
                                rows={5}
                                className={`w-full bg-black/20 border ${errors.problemStatement ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all resize-none`}
                            />
                            {errors.problemStatement && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.problemStatement}</p>}
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                                <Lightbulb size={16} className="text-yellow-400" /> Proposed Solution (The What)
                            </label>
                            <textarea
                                value={formData.proposedSolution}
                                onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                                placeholder="How do you imagine it working? e.g. Add a button that..."
                                rows={5}
                                className={`w-full bg-black/20 border ${errors.proposedSolution ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all resize-none`}
                            />
                            {errors.proposedSolution && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.proposedSolution}</p>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-4 py-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-yellow-400 hover:bg-white text-[#1A2B3C] font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-yellow-400/20"
                    >
                        Next Step <ArrowRight size={18} />
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
