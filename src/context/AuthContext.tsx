import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isStaff: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<UserRole, { email: string; name: string; org: string }> = {
  attendee: { email: 'attendee@eventpulse.com', name: 'Zainab Ahmed', org: 'Tech Community Member' },
  organizer: { email: 'organizer@eventpulse.com', name: 'Farhan Malik (Pulse Events)', org: 'Pulse Productions' },
  admin: { email: 'admin@eventpulse.com', name: 'Syed Raza (System Director)', org: 'EventPulse HQ' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eventpulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eventpulse_token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      quickLogin('attendee');
    }
  }, []);

  const login = async (email: string, password = 'password123'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('eventpulse_user', JSON.stringify(data.user));
        localStorage.setItem('eventpulse_token', data.token);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err) {
      console.error('Login error:', err);
      // Resilient fallback
      const matchedRole = (Object.keys(DEMO_ACCOUNTS).find(
        (r) => DEMO_ACCOUNTS[r as UserRole].email === email
      ) as UserRole) || 'attendee';

      const demoUser: User = {
        _id: `user_${matchedRole}`,
        name: DEMO_ACCOUNTS[matchedRole].name,
        email,
        role: matchedRole,
        organization: DEMO_ACCOUNTS[matchedRole].org,
      };
      setUser(demoUser);
      setToken('demo_token');
      localStorage.setItem('eventpulse_user', JSON.stringify(demoUser));
      localStorage.setItem('eventpulse_token', 'demo_token');
      setIsLoading(false);
      return true;
    }
  };

  const quickLogin = async (targetRole: UserRole): Promise<boolean> => {
    const demo = DEMO_ACCOUNTS[targetRole];
    return await login(demo.email, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventpulse_user');
    localStorage.removeItem('eventpulse_token');
  };

  const role: UserRole = user ? user.role : 'attendee';
  const isStaff = role === 'organizer' || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isStaff,
        login,
        quickLogin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
