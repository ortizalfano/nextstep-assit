import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';

interface LoginProps {
    onLogin: (email: string) => void;
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onLogin(email);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-mint-green rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-mint-green/20">
                    <div className="w-6 h-6 border-2 border-[#1A2B3C] rounded-full" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
                <p className="text-white/40 text-sm">Sign in to access your workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-mint-green transition-colors" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 focus:ring-1 focus:ring-mint-green/50 transition-all"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">Password</label>
                        <button type="button" className="text-xs text-mint-green hover:text-white transition-colors">Forgot password?</button>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-mint-green transition-colors" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-mint-green/50 focus:ring-1 focus:ring-mint-green/50 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-mint-green/20 flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? <Loader className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
                </button>
            </form>

            {/* Dev Helper - Remove in production */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50 text-center">
                <p className="uppercase tracking-wider font-bold mb-2 text-mint-green">Dev Mode: Role Testing</p>
                <p>Login with email containing <span className="text-white">"admin"</span> or <span className="text-white">"manager"</span> to switch roles.</p>
                <p className="mt-1 opacity-60">e.g. admin@nextstep.com</p>
            </div>

            <div className="mt-6 border-t border-white/5 text-center pt-6">
                <p className="text-white/40 text-sm">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToRegister} className="text-mint-green hover:text-white font-medium transition-colors">
                        create one
                    </button>
                </p>
            </div>
        </div>
    );
};
