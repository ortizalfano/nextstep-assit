import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Wizard } from './components/Wizard/Wizard';
import { AuthLayout } from './components/Auth/AuthLayout';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';

// Simple User Type Definition
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('nextstep_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('nextstep_user');
      }
    }
  }, []);

  // Handle Login with real User object from API (updates App state)
  const handleLogin = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('nextstep_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('nextstep_token', token);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView('login');
    localStorage.removeItem('nextstep_user');
    localStorage.removeItem('nextstep_token');
  };

  const [lastUpdate, setLastUpdate] = useState(0);

  const handleTicketCreated = () => {
    setLastUpdate(Date.now());
  };

  if (!user) {
    return (
      <AuthLayout>
        {authView === 'login' ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView('register')}
          />
        ) : (
          <Register
            onRegister={(user) => handleLogin(user)}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="h-screen w-full bg-[#1A2B3C] text-white overflow-hidden font-sans">
      <Dashboard user={user} onLogout={handleLogout} lastUpdate={lastUpdate}>
        <Wizard userRole={user.role} onTicketCreated={handleTicketCreated} currentUser={user} />
      </Dashboard>
    </div>
  );
}

export default App;
