import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, ArrowRight, Loader } from 'lucide-react';
import { api } from '../../lib/api';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'manager' | 'admin'>('user');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.users.create({ name, email, password, role });
            onUserCreated();
            onClose();
            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (error: any) {
            alert(`Failed to create user: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#1A2B3C] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white">Invite User</h2>
                    <p className="text-white/40 text-sm">Create a new account for your team member</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 text-sm"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 text-sm"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Temporary Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 text-sm font-mono"
                                placeholder="e.g. Welcome2024!"
                                required
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-mint-green/50 text-sm appearance-none"
                            >
                                <option value="user" className="bg-[#1A2B3C]">User</option>
                                <option value="manager" className="bg-[#1A2B3C]">Manager</option>
                                <option value="admin" className="bg-[#1A2B3C]">Admin</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold py-3 rounded-xl transition-all shadow-lg shadow-mint-green/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? <Loader className="animate-spin" size={18} /> : <>Create User <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};
