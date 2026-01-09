import { useState } from 'react';
import { Settings, Upload, FileText, CheckCircle2, Eye, EyeOff, Save } from 'lucide-react';

export const KnowledgeBase = () => {
    // State for API Key
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // State for Files
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [files] = useState<{ name: string; status: 'indexing' | 'ready' | 'error'; size: string }[]>([
        { name: 'Policy_2024.pdf', status: 'ready', size: '2.4 MB' },
        { name: 'Troubleshooting_Guide_v2.pdf', status: 'indexing', size: '1.1 MB' },
    ]);

    const handleSaveKey = () => {
        if (!apiKey) return;
        // Simulate saving
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="w-full space-y-8 mt-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <FileText size={24} />
                    </span>
                    Knowledge Base
                </h2>
                <p className="text-white/40">Manage your AI's brain. Upload documents and configure connection settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: API Configuration */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-white/60" /> Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                                Gemini API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full bg-[#0F1924] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-white/30 mt-2">
                                Required for the chatbot to process inquiries. Key is stored securely.
                            </p>
                        </div>

                        <button
                            onClick={handleSaveKey}
                            className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${isSaved
                                ? 'bg-mint-green text-[#1A2B3C]'
                                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                                }`}
                        >
                            {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            {isSaved ? 'Saved Successfully' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Training Data */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Area */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer group text-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload size={32} className="text-indigo-400" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">Upload Training Documents</h4>
                        <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
                            Drag and drop PDF files here, or click to browse. These files will be indexed for the chatbot context.
                        </p>
                        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                            Select Files
                        </button>
                    </div>

                    {/* File List */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="font-medium text-white text-sm">Indexed Documents (2)</h3>
                            <span className="text-xs text-mint-green bg-mint-green/10 px-2 py-1 rounded border border-mint-green/20">System Online</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {files.map((file, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-[#1A2B3C] border border-white/10">
                                            <FileText size={20} className="text-white/60" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{file.name}</p>
                                            <p className="text-xs text-white/30">{file.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {file.status === 'ready' && (
                                            <span className="flex items-center gap-1.5 text-xs text-mint-green bg-mint-green/5 px-2 py-1 rounded-full border border-mint-green/10">
                                                <CheckCircle2 size={12} /> Ready
                                            </span>
                                        )}
                                        {file.status === 'indexing' && (
                                            <span className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-400/5 px-2 py-1 rounded-full border border-orange-400/10">
                                                <div className="w-2 h-2 rounded-full border-2 border-orange-400 border-r-transparent animate-spin" /> Indexing...
                                            </span>
                                        )}
                                        <button className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                            <Upload size={16} className="rotate-45" /> {/* Use as delete/remove icon visually */}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
