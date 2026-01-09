import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-[#1A2B3C] relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen animate-blob" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-mint-green/10 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000" />

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-8 md:p-10">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
