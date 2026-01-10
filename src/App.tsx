import { useState } from 'react';
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

  // Handle Login with real User object from API
  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView('login');
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
        <Wizard userRole={user.role} onTicketCreated={handleTicketCreated} />
      </Dashboard>
    </div>
  );
}

export default App;
