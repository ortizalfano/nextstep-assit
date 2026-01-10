import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { CreateUserModal } from './CreateUserModal';
import { UserTicketsModal } from './UserTicketsModal';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    created_at: string;
    avatar_url: string;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // For User Tickets Modal
    const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
    const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.users.list();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.users.delete(id);
            loadUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleRoleUpdate = async (id: number, newRole: string) => {
        try {
            await api.users.update(id, { role: newRole });
            loadUsers();
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const handleViewTickets = (user: User) => {
        setSelectedUser({ id: user.id, name: user.name });
        setIsTicketsModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 w-64"
                    />
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-mint-green hover:bg-white text-[#1A2B3C] font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-mint-green/10"
                >
                    <Plus size={16} /> Add User
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-white/40">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-white/40">No users found.</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full bg-white/10" />
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-xs text-white/40">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                className={`bg-transparent border-none text-xs font-medium rounded px-2 py-1 cursor-pointer focus:ring-0 ${user.role === 'admin' ? 'text-purple-400 bg-purple-500/10' :
                                                    user.role === 'manager' ? 'text-blue-400 bg-blue-500/10' :
                                                        'text-white/60 bg-white/5'
                                                    }`}
                                            >
                                                <option value="user" className="bg-[#1A2B3C] text-white">User</option>
                                                <option value="manager" className="bg-[#1A2B3C] text-white">Manager</option>
                                                <option value="admin" className="bg-[#1A2B3C] text-white">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-sm text-white/40">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleViewTickets(user)}
                                                    className="p-1.5 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300 transition-colors"
                                                    title="View Tickets"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 hover:bg-white/10 rounded text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onUserCreated={loadUsers}
            />

            <UserTicketsModal
                isOpen={isTicketsModalOpen}
                onClose={() => setIsTicketsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};
