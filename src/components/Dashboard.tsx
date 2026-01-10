import React, { useState } from 'react';
import { ShieldCheck, LogOut, LayoutDashboard, List, BookOpen, Users } from 'lucide-react';
import type { User } from '../App';
import { TicketList } from './TicketList/TicketList';
import { AdminStats } from './Admin/AdminStats';
import { KnowledgeBase } from './Admin/KnowledgeBase';
import { UserManagement } from './Admin/UserManagement';
import { ChatWidget } from './AI/ChatWidget';

interface DashboardProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  lastUpdate?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ children, user, onLogout, lastUpdate }) => {
  // 'overview' = Admin Stats, 'tickets' = Ticket List + Wizard, 'knowledge' = AI Training, 'users' = User Management
  // Default to 'overview' for admins, 'tickets' for users
  const [view, setView] = useState<'overview' | 'tickets' | 'knowledge' | 'users'>(
    user.role === 'user' ? 'tickets' : 'overview'
  );

  const isPrivileged = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="flex flex-col h-full relative">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      {/* Header */}
      <header className="flex-none px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#1A2B3C]/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">NextStep Financial</h1>
            <p className="text-white/40 text-xs">Support Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* View Switcher for Admins */}
          {isPrivileged && (
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 mr-4">
              <button
                onClick={() => setView('overview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'overview' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
              >
                <LayoutDashboard size={14} /> Overview
              </button>
              <button
                onClick={() => setView('tickets')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'tickets' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
              >
                <List size={14} /> Tickets
              </button>
              <button
                onClick={() => setView('users')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'users' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
              >
                <Users size={14} /> Users
              </button>
              <button
                onClick={() => setView('knowledge')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'knowledge' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
              >
                <BookOpen size={14} /> Knowledge
              </button>
            </div>
          )}

          {/* Role Badge */}
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 capitalize">
            {user.role}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Horizontal Layout for Users to include Chat Sidebar */}
      <div className="flex-1 flex overflow-hidden relative z-10 w-full">
        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-8">
          {/* Content Wrapper */}
          <div className={`w-full max-w-6xl flex flex-col items-center ${view === 'tickets' && isPrivileged ? 'gap-6 mt-4' : 'gap-12 my-auto'}`}>

            {/* Welcome Section - Hide for Admin Ticket View, Users, & Knowledge */}
            {!((view === 'tickets' && isPrivileged) || view === 'knowledge' || view === 'users') && (
              <div className="w-full text-left">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">{user.name.split(' ')[0]}</span>
                </h2>
                <p className="text-xl text-white/40 font-light">
                  {view === 'overview' ? 'Here is the platform overview for today.' : 'Everything is running smoothly. How can we verify your systems today?'}
                </p>
              </div>
            )}

            {/* Admin Stats View */}
            {view === 'overview' && isPrivileged && (
              <AdminStats />
            )}

            {/* Admin Knowledge Base */}
            {view === 'knowledge' && isPrivileged && (
              <KnowledgeBase />
            )}

            {/* Admin User Management */}
            {view === 'users' && isPrivileged && (
              <div className="w-full h-[600px]">
                <UserManagement />
              </div>
            )}

            {/* Ticket/Wizard View */}
            {view === 'tickets' && (
              <>
                {/* Wizard Container */}
                <div className="w-full">
                  {children}
                </div>

                {/* Ticket List Section */}
                <TicketList user={user} refreshTrigger={lastUpdate} />
              </>
            )}
          </div>
        </main>

        {/* Chat Widget - Renders as Sidebar for User, Floating for Admin */}
        <ChatWidget userRole={user.role} />
      </div>
    </div>
  );
};
