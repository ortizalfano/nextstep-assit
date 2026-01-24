import { useState, useEffect, useRef } from 'react';
import { Settings, Upload, FileText, CheckCircle2, Eye, EyeOff, Save, Loader, Trash2 } from 'lucide-react';

export const KnowledgeBase = () => {
    // State for API Key
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSavingKey, setIsSavingKey] = useState(false);
    const [configLoaded, setConfigLoaded] = useState(false);

    // State for Files
    const [files, setFiles] = useState<{ id: number; filename: string; status: 'indexing' | 'ready' | 'error'; size?: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Initial Data
    useEffect(() => {
        fetchConfig();
        fetchFiles();
    }, []);

    const fetchConfig = async () => {
        try {
            // We need to add a method to api.ts or just fetch here directly using the token we have in localStorage
            // For expediency, I'll direct fetch here, but ideally we add to api.ts
            const token = localStorage.getItem('nextstep_token');
            const res = await fetch('/api/knowledge/config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.isConfigured) {
                setApiKey(data.maskedKey || '••••••••');
                setConfigLoaded(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('nextstep_token');
            const res = await fetch('/api/knowledge', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setFiles(data);
            } else {
                setFiles([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const handleSaveKey = async () => {
        if (!apiKey || apiKey.includes('•••')) return; // Don't resave masked key
        setIsSavingKey(true);
        try {
            const token = localStorage.getItem('nextstep_token');
            console.log("Debug: Sending request with token:", token ? "Present" : "Missing"); // Debug Log

            const res = await fetch('/api/knowledge/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ apiKey })
            });

            if (res.ok) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
                fetchConfig(); // Refresh to ensure masked state logic if needed
            }
        } catch (e) {
            console.error(e);
            alert('Failed to save API Key');
        } finally {
            setIsSavingKey(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        // Simple size check (e.g. 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Max 5MB.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('nextstep_token');
            const res = await fetch('/api/knowledge/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // Form data handles content-type boundary automatically
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            await fetchFiles(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteFile = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            const token = localStorage.getItem('nextstep_token');
            await fetch('/api/knowledge?id=' + id, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFiles(prev => prev.filter(f => f.id !== id));
        } catch (e) {
            console.error(e);
        }
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
                                    placeholder={configLoaded ? "••••••••" : "sk-..."}
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
                            disabled={isSavingKey}
                            className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${isSaved
                                ? 'bg-mint-green text-[#1A2B3C]'
                                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                                }`}
                        >
                            {isSavingKey ? <Loader size={16} className="animate-spin" /> : isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            {isSaved ? 'Saved Successfully' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Training Data */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer group text-center"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileUpload}
                        />
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            {isUploading ? <Loader size={32} className="text-indigo-400 animate-spin" /> : <Upload size={32} className="text-indigo-400" />}
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">{isUploading ? 'Uploading & Indexing...' : 'Upload Training Documents'}</h4>
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
                            <h3 className="font-medium text-white text-sm">Indexed Documents ({files.length})</h3>
                            <span className="text-xs text-mint-green bg-mint-green/10 px-2 py-1 rounded border border-mint-green/20">System Online</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {isLoadingFiles ? (
                                <div className="p-8 text-center text-white/20 text-sm">Loading documents...</div>
                            ) : files.length === 0 ? (
                                <div className="p-8 text-center text-white/20 text-sm">No documents uploaded yet.</div>
                            ) : (
                                files.map((file) => (
                                    <div key={file.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded bg-[#1A2B3C] border border-white/10">
                                                <FileText size={20} className="text-white/60" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{file.filename}</p>
                                                {/* <p className="text-xs text-white/30">{file.size || 'Unknown size'}</p> */}
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
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-2 text-white/20 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
