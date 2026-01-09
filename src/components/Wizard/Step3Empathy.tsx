import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, UploadCloud, FileText } from 'lucide-react';

interface Step3Props {
    onNext: (data: any) => void;
    onBack: () => void;
}

export const Step3Empathy: React.FC<Step3Props> = ({ onNext, onBack }) => {
    const [stressLevel, setStressLevel] = useState(50);
    const [file, setFile] = useState<File | null>(null);

    const getEmotion = (level: number) => {
        if (level < 25) return { label: 'Minor Hiccup', emoji: '😌', color: 'text-mint-green' };
        if (level < 50) return { label: 'Annoying', emoji: '😐', color: 'text-yellow-400' };
        if (level < 75) return { label: 'Frustrating', emoji: '😠', color: 'text-orange-400' };
        return { label: 'Work Stopper', emoji: '🚨', color: 'text-red-500' };
    };

    const emotion = getEmotion(stressLevel);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">Impact & Evidence</h2>
                <p className="text-white/60">Help us understand the severity and see the issue.</p>
            </div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
            >
                <div className="space-y-10">
                    {/* Impact Slider */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-sm font-medium text-white/80">Stress Level / Impact</label>
                            <div className={`text-right ${emotion.color}`}>
                                <span className="text-2xl mr-2">{emotion.emoji}</span>
                                <span className="font-bold text-lg">{emotion.label}</span>
                            </div>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={stressLevel}
                            onChange={(e) => setStressLevel(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-mint-green"
                        />
                        <div className="flex justify-between text-xs text-white/30 mt-2">
                            <span>Low Priority</span>
                            <span>Critical</span>
                        </div>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed ${file ? 'border-mint-green bg-mint-green/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5'} rounded-2xl p-8 transition-all flex flex-col items-center justify-center`}>
                            {file ? (
                                <>
                                    <FileText size={40} className="text-mint-green mb-2" />
                                    <p className="text-white font-medium">{file.name}</p>
                                    <p className="text-white/40 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                                    <p className="text-mint-green text-sm mt-4">Click to change</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={24} className="text-white/70" />
                                    </div>
                                    <p className="text-white font-medium">Upload Screenshot or Log</p>
                                    <p className="text-white/40 text-sm">Drag & drop or browse</p>
                                </>
                            )}
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
                        onClick={() => onNext({ severity: stressLevel, files: file ? [file] : [] })}
                        className="bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-mint-green/20"
                    >
                        Review Ticket <ArrowRight size={18} />
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
