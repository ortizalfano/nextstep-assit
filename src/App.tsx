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

  // Mock Login - In real app, this comes from API
  const handleLogin = (email: string) => {
    // Simulate role based on email for testing
    let role: User['role'] = 'user';
    if (email.includes('admin')) role = 'admin';
    else if (email.includes('manager')) role = 'manager';

    setUser({
      id: 1,
      name: 'Test User',
      email,
      role
    });
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView('login');
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
            onRegister={() => handleLogin('newuser@nextstepfinancial.services')}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="h-screen w-full bg-[#1A2B3C] text-white overflow-hidden font-sans">
      <Dashboard user={user} onLogout={handleLogout}>
        <Wizard userRole={user.role} />
      </Dashboard>
    </div>
  );
}

export default App;
