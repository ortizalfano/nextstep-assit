import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import { AccountRequestModal } from './AccountRequestModal';
import { api } from '../../lib/api';

interface RegisterProps {
    onRegister: () => void;
    onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // ... inside component ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Domain Check
        if (!email.endsWith('@nextstepfinancial.services')) {
            setShowRequestModal(true);
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.register({ name, email, password });
            onRegister();
        } catch (error: any) {
            console.error('Registration failed:', error);
            alert(`Registration failed: ${error.message || 'Please try again'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-white/40 text-sm">Join the team and start collaborating</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-mint-green transition-colors" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 focus:ring-1 focus:ring-mint-green/50 transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-mint-green transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 focus:ring-1 focus:ring-mint-green/50 transition-all"
                                placeholder="name@nextstepfinancial.services"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-mint-green transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 focus:ring-1 focus:ring-mint-green/50 transition-all"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-mint-green/20 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? <Loader className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-white/40 text-sm">
                        Already have an account?{' '}
                        <button onClick={onSwitchToLogin} className="text-mint-green hover:text-white font-medium transition-colors">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>

            <AccountRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                email={email}
                name={name}
            />
        </>
    );
};
