import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Link as LinkIcon, ArrowLeft, ArrowRight } from 'lucide-react';

interface Step3FeatureProps {
    onNext: (data: any) => void;
    onBack: () => void;
    data: any;
}

export const Step3FeatureEvidence: React.FC<Step3FeatureProps> = ({ onNext, onBack, data }) => {
    const [files, setFiles] = useState<File[]>(data.files || []);
    const [exampleLink, setExampleLink] = useState(data.exampleLink || '');
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            setFiles([...files, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        onNext({ files, exampleLink });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">Visualize your idea</h2>
                <p className="text-white/60">A sketch or example is worth a thousand words.</p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
            >
                <div className="space-y-8">

                    {/* Visual Upload Zone */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Upload Sketch or Mockup</label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border - 2 border - dashed rounded - 2xl p - 8 text - center transition - all ${isDragging ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 hover:border-white/20 bg-black/20'} `}
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <ImageIcon size={32} className="text-white/60" />
                            </div>
                            <p className="text-white font-medium mb-1">Drop your sketch here</p>
                            <p className="text-white/40 text-sm mb-4">or click to browse checks, wireframes, or screenshots</p>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                id="file-upload"
                                onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])}
                            />
                            <label
                                htmlFor="file-upload"
                                className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors cursor-pointer"
                            >
                                Browse Files
                            </label>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                                <ImageIcon size={14} className="text-white/60" />
                                            </div>
                                            <span className="text-sm text-white/80">{file.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(i)} className="text-white/40 hover:text-red-400">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inspiration Link */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <LinkIcon size={16} className="text-blue-300" /> Link to Example (Optional)
                        </label>
                        <input
                            type="text"
                            value={exampleLink}
                            onChange={(e) => setExampleLink(e.target.value)}
                            placeholder="https://dribbble.com/shots/..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                        />
                        <p className="text-white/30 text-xs mt-2 ml-1">Safe-listed domains: Dribbble, Behance, Loom, Figma</p>
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
                        Review Idea <ArrowRight size={18} />
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
