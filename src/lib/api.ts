
// src/lib/api.ts

const API_BASE = '/api';

export const api = {
    auth: {
        login: async (email: string) => {
            // Since we mocked role in Login.tsx before, now we want to actually hit the API.
            // But for the pure "Auth" flow described in "Login.tsx" where we passed email...
            // We should ideally send password too. 
            // For now, we'll send email and a dummy password to our new endpoint.
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'demo-password' })
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
    tickets: {
        list: async (role: string, userId: string) => {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (userId && role !== 'admin' && role !== 'manager') params.append('user_id', userId);

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
