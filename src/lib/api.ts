
// src/lib/api.ts

const API_BASE = '/api';

export const api = {
    auth: {
        login: async (email: string, password?: string) => {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: password || 'demo-password' })
            });
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        },
        register: async (data: any) => {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                let errorMessage = 'Registration failed';
                try {
                    const text = await res.text();
                    try {
                        const err = JSON.parse(text);
                        errorMessage = err.error || errorMessage;
                    } catch {
                        errorMessage = text || errorMessage;
                    }
                } catch (e) {
                    console.error("Error reading error response", e);
                }
                throw new Error(errorMessage);
            }
            return res.json();
        }
    },
    users: {
        list: async () => {
            const res = await fetch(`${API_BASE}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        create: async (userData: any) => {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to create user');
            }
            return res.json();
        },
        update: async (id: number, updates: any) => {
            const res = await fetch(`${API_BASE}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update user');
            return res.json();
        },
        delete: async (id: number) => {
            const res = await fetch(`${API_BASE}/users/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete user');
            return res.json();
        }
    },
    tickets: {
        list: async (role: string, userId: string, filterByUserId?: string) => {
            const params = new URLSearchParams();
            if (role) params.append('role', role);

            // Logic: 
            // If User -> userId param is mandatorily their own ID (usually enforced by backend, here by param)
            // If Admin -> userId param matches them. filterByUserId is the target they want to view details for.

            const targetUser = filterByUserId || (role !== 'admin' && role !== 'manager' ? userId : null);
            if (targetUser) params.append('user_id', targetUser);

            const res = await fetch(`${API_BASE}/tickets?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch tickets');
            return res.json();
        },
        create: async (ticketData: any) => {
            const res = await fetch(`${API_BASE}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
            if (!res.ok) throw new Error('Failed to create ticket');
            return res.json();
        },
        comments: {
            list: async (ticketId: string) => {
                const res = await fetch(`${API_BASE}/tickets/${ticketId}/comments`);
                if (!res.ok) throw new Error('Failed to fetch comments');
                return res.json();
            },
            create: async (ticketId: string, content: string, userId: string) => {
                const res = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, user_id: userId })
                });
                if (!res.ok) throw new Error('Failed to create comment');
                return res.json();
            }
        }
    },
    admin: {
        stats: async () => {
            const res = await fetch(`${API_BASE}/admin/stats`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        }
    },
    chat: {
        send: async (message: string, history: any[], apiKey?: string) => {
            const res = await fetch(`${API_BASE}/chat/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history, apiKey })
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.json();
        }
    }
};
