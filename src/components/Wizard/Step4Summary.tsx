
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, FileText, AlertOctagon, Bug, ClipboardCheck, List, Repeat, Users, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { api } from '../../lib/api';

interface Step4Props {
    data: any;
    onReset: () => void;
    onSuccess?: () => void;
    currentUser?: any;
}

export const Step4Summary: React.FC<Step4Props> = ({ data, onReset, onSuccess, currentUser }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                type: data.reportType, // 'bug' or 'feature'
                subject: data.subject,
                description: data.description || (data.reportType === 'feature' ? data.problemStatement : data.description),

                // Bug fields
                category: data.category,
                module: data.module,
                frequency: data.frequency,
                scope: data.scope,
                severity: data.severity ? String(data.severity) : undefined, // Convert to string as schema is now text
                current_behavior: data.currentBehavior,
                expected_behavior: data.expectedBehavior,
                steps_to_reproduce: data.stepsToReproduce,

                // Feature fields
                problem_statement: data.problemStatement,
                proposed_solution: data.proposedSolution,
                business_value: data.businessValue,

                // Priority Mapping
                // For bugs: Map severity (0-100) to priority string ('low', 'medium', 'high', 'critical')
                // For features: Use data.priority (0-100) as string
                priority: data.reportType === 'bug'
                    ? (
                        data.severity > 80 ? 'critical' :
                            data.severity > 50 ? 'high' :
                                data.severity > 20 ? 'medium' : 'low'
                    )
                    : (data.priority ? String(data.priority) : undefined),

                // Common
                files: data.files ? data.files.map((f: any) => f.name) : [],
                example_link: data.exampleLink,

                // Created By
                created_by: currentUser?.id
            };

            // Fallback if currentUser is missing (shouldn't happen with new flow)
            if (!payload.created_by) {
                const storedUser = localStorage.getItem('nextstep_user');
                if (storedUser) {
                    payload.created_by = JSON.parse(storedUser).id;
                }
            }

            await api.tickets.create(payload);
            setIsSuccess(true);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to submit ticket:', error);
            alert('Failed to submit ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-mint-green rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-mint-green/30"
                >
                    <CheckCircle size={48} className="text-[#1A2B3C]" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-light text-white mb-2"
                >
                    {data.reportType === 'feature' ? 'Request Submitted' : 'Ticket Submitted'}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/60 mb-8 max-w-sm"
                >
                    {data.reportType === 'feature'
                        ? "Thanks for your idea! We love hearing how we can make Collect! better for you."
                        : "Take a breath. We've received your report and our team is already on it."}
                </motion.p>
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={onReset}
                    className="text-white/40 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <RefreshCw size={16} /> {data.reportType === 'feature' ? 'Share another idea' : 'Submit another issue'}
                </motion.button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">Review Details</h2>
                <p className="text-white/60">Everything look correct?</p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
            >
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                                {data.reportType === 'feature' ? 'Feature Title' : 'Issue Subject'}
                            </p>
                            <p className="text-white font-bold text-lg">{data.subject}</p>
                        </div>
                        <div className="flex gap-4">
                            {data.reportType === 'bug' ? (
                                <>
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-mint-green font-medium border border-mint-green/20">
                                        {data.category?.replace('_', ' ')}
                                    </span>
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70 font-medium">
                                        {data.module}
                                    </span>
                                </>
                            ) : (
                                <span className="px-3 py-1 bg-yellow-400/10 rounded-full text-xs text-yellow-400 font-medium border border-yellow-400/20">
                                    Feature Request
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Context Stats */}
                    {data.reportType === 'feature' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-300"><Target size={18} /></div>
                                <div>
                                    <p className="text-xs text-white/40 uppercase">Business Value</p>
                                    <p className="text-sm font-medium text-white">{data.businessValue}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300"><TrendingUp size={18} /></div>
                                <div>
                                    <p className="text-xs text-white/40 uppercase">Priority</p>
                                    <p className="text-sm font-medium text-white">
                                        {data.priority < 33 ? 'Nice to Have' : data.priority < 66 ? 'Important' : 'Critical'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300"><Repeat size={18} /></div>
                                <div>
                                    <p className="text-xs text-white/40 uppercase">Frequency</p>
                                    <p className="text-sm font-medium text-white">{data.frequency}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300"><Users size={18} /></div>
                                <div>
                                    <p className="text-xs text-white/40 uppercase">Scope</p>
                                    <p className="text-sm font-medium text-white">{data.scope}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    {data.reportType === 'feature' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                                <div className="flex items-center gap-2 mb-2 text-red-300/80">
                                    <AlertOctagon size={16} />
                                    <p className="text-xs uppercase tracking-wider">Problem Statement</p>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed">{data.problemStatement}</p>
                            </div>
                            <div className="p-4 bg-yellow-400/5 rounded-xl border border-yellow-400/10">
                                <div className="flex items-center gap-2 mb-2 text-yellow-400/80">
                                    <Lightbulb size={16} />
                                    <p className="text-xs uppercase tracking-wider">Proposed Solution</p>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed">{data.proposedSolution}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Steps to Reproduce */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-3 text-white/80">
                                    <List size={16} className="text-mint-green" />
                                    <p className="text-xs uppercase tracking-wider font-semibold">Steps to Reproduce</p>
                                </div>
                                <ul className="space-y-2">
                                    {data.stepsToReproduce?.map((step: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-white/70">
                                            <span className="font-mono text-white/30">{i + 1}.</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Behavior Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                                    <div className="flex items-center gap-2 mb-2 text-red-300/80">
                                        <Bug size={16} />
                                        <p className="text-xs uppercase tracking-wider">Current Behavior</p>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">{data.currentBehavior}</p>
                                </div>
                                <div className="p-4 bg-mint-green/5 rounded-xl border border-mint-green/10">
                                    <div className="flex items-center gap-2 mb-2 text-mint-green/80">
                                        <ClipboardCheck size={16} />
                                        <p className="text-xs uppercase tracking-wider">Expected Result</p>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">{data.expectedBehavior}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Attachments & Impact */}
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <FileText className="text-white/40" />
                                <p className="text-xs text-white/40 uppercase tracking-wider">Attachments & Links</p>
                            </div>
                            <p className="text-white text-sm pl-7 truncate">{data.files?.length > 0 ? data.files[0].name : 'No files'}</p>
                            {data.exampleLink && (
                                <p className="text-blue-300 text-xs pl-7 mt-1 truncate max-w-[200px] hover:underline cursor-pointer" title={data.exampleLink}>{data.exampleLink}</p>
                            )}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                            <AlertOctagon className={data.severity > 75 ? "text-red-500" : "text-yellow-400"} />
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">{data.reportType === 'feature' ? 'Priority' : 'Impact'}</p>
                                <p className="text-white text-sm">
                                    {data.reportType === 'feature'
                                        ? (data.priority < 33 ? 'Low' : data.priority < 66 ? 'Medium' : 'High')
                                        : (data.severity > 75 ? 'Critical' : 'Normal')
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full ${data.reportType === 'feature' ? 'bg-yellow-400 text-[#1A2B3C] shadow-yellow-400/20' : 'bg-mint-green text-[#1A2B3C] shadow-mint-green/20'} hover:bg-white font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? (
                                <RefreshCw className="animate-spin" />
                            ) : (
                                <>{data.reportType === 'feature' ? 'Submit Idea' : 'Submit Ticket'}</>
                            )}
                        </button>
                    </div>

                </div>

            </motion.div>
        </div>
    );
};
