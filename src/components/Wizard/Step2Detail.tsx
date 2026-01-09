import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, AlertCircle, Plus, Trash2, List } from 'lucide-react';

interface Step2Props {
    onNext: (data: any) => void;
    onBack: () => void;
    data: any;
}

const modules = [
    'Debtor Screen',
    'Client Reports',
    'Legal Workflow',
    'Payment Processing',
    'User Management'
];

const frequencies = ['Always', 'Intermittently', 'First time noticed'];

export const Step2Detail: React.FC<Step2Props> = ({ onNext, onBack, data }) => {
    const [formData, setFormData] = useState({
        subject: data.subject || '',
        module: data.module || '',
        frequency: data.frequency || '',
        scope: data.scope || 'Just me',
        currentBehavior: data.currentBehavior || '',
        expectedBehavior: data.expectedBehavior || '',
        stepsToReproduce: data.stepsToReproduce || [''],
    });
    const [errors, setErrors] = useState<any>({});

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            stepsToReproduce: [...prev.stepsToReproduce, '']
        }));
    };

    const removeStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stepsToReproduce: prev.stepsToReproduce.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateStep = (index: number, value: string) => {
        const newSteps = [...formData.stepsToReproduce];
        newSteps[index] = value;
        setFormData(prev => ({ ...prev, stepsToReproduce: newSteps }));
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.module) newErrors.module = 'Please select a module';
        if (!formData.frequency) newErrors.frequency = 'Select frequency';
        if (!formData.currentBehavior.trim()) newErrors.currentBehavior = 'Required';
        if (!formData.expectedBehavior.trim()) newErrors.expectedBehavior = 'Required';

        // Validate that at least the first step has content
        if (formData.stepsToReproduce.length === 0 || !formData.stepsToReproduce[0].trim()) {
            newErrors.steps = 'Please add at least one step';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext(formData);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">The Details</h2>
                <p className="text-white/60">Help us reproduce the issue by being specific.</p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
            >
                <div className="space-y-8">
                    {/* Row 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief summary of the issue"
                                className={`w-full bg-black/20 border ${errors.subject ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-all`}
                            />
                            {errors.subject && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.subject}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">System Module</label>
                            <select
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                className={`w-full bg-black/20 border ${errors.module ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-all`}
                            >
                                <option value="" className="bg-[#1A2B3C]">Select a module...</option>
                                {modules.map(m => <option key={m} value={m} className="bg-[#1A2B3C]">{m}</option>)}
                            </select>
                            {errors.module && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.module}</p>}
                        </div>
                    </div>

                    {/* Row 2: Frequency & Scope */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">How often does it happen?</label>
                            <div className="flex gap-2">
                                {frequencies.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFormData({ ...formData, frequency: f })}
                                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${formData.frequency === f ? 'bg-mint-green text-[#1A2B3C] border-mint-green font-medium' : 'bg-black/20 text-white/60 border-white/10 hover:border-white/30'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            {errors.frequency && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.frequency}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Who is affected?</label>
                            <div className="flex gap-4 p-3 bg-black/20 rounded-xl border border-white/10">
                                {['Just me', 'Whole team'].map(s => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="scope"
                                            checked={formData.scope === s}
                                            onChange={() => setFormData({ ...formData, scope: s })}
                                            className="accent-mint-green"
                                        />
                                        <span className={`text-sm ${formData.scope === s ? 'text-white' : 'text-white/60'}`}>{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Investigation Steps (The new feature) */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                                <List size={16} className="text-mint-green" /> Steps to Reproduce
                            </label>
                            <button onClick={addStep} className="text-xs text-mint-green hover:text-white flex items-center gap-1 transition-colors">
                                <Plus size={14} /> Add Step
                            </button>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {formData.stepsToReproduce.map((step: string, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex gap-3"
                                    >
                                        <span className="flex-none w-6 h-10 flex items-center justify-center text-white/40 font-mono text-sm">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={step}
                                            autoFocus={index === formData.stepsToReproduce.length - 1 && index !== 0}
                                            onChange={(e) => updateStep(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addStep();
                                                }
                                                if (e.key === 'Backspace' && step === '' && formData.stepsToReproduce.length > 1) {
                                                    e.preventDefault();
                                                    removeStep(index);
                                                }
                                            }}
                                            placeholder={index === 0 ? "e.g. Log in to the dashboard" : "Next step..."}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green transition-all"
                                        />
                                        {formData.stepsToReproduce.length > 1 && (
                                            <button onClick={() => removeStep(index)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {errors.steps && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.steps}</p>}
                    </div>

                    {/* Row 4: Behavior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Current Behavior (Failing)</label>
                            <textarea
                                value={formData.currentBehavior}
                                onChange={(e) => setFormData({ ...formData, currentBehavior: e.target.value })}
                                rows={3}
                                className={`w-full bg-black/20 border ${errors.currentBehavior ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-all resize-none`}
                            />
                            {errors.currentBehavior && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.currentBehavior}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Expected Behavior</label>
                            <textarea
                                value={formData.expectedBehavior}
                                onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                                rows={3}
                                className={`w-full bg-black/20 border ${errors.expectedBehavior ? 'border-red-400' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-all resize-none`}
                            />
                            {errors.expectedBehavior && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.expectedBehavior}</p>}
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
                        className="bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-mint-green/20"
                    >
                        Next Step <ArrowRight size={18} />
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
