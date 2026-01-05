import { createContext, useContext, ReactNode } from 'react';

// Mock user for development - no authentication required
const mockUser = {
  id: 'demo-user-001',
  email: 'demo@mgp.ai',
  user_metadata: { full_name: 'Demo User' },
};

interface AuthContextType {
  user: typeof mockUser;
  session: null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const signOut = async () => {
    // No-op for now since we don't have auth
  };

  return (
    <AuthContext.Provider value={{ user: mockUser, session: null, signOut, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};