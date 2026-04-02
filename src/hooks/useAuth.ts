import { createContext, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; username: string; role: string } | null;
  login: (token: string, user: { id: string; username: string; role: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
