import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "vendedor";
  company: string;
  phone: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const mockUsers: User[] = [
  {
    id: "U001",
    name: "Admin Cyaco",
    email: "admin@cyaco.mx",
    role: "admin",
    company: "Cyaco Tecnología Industrial",
    phone: "+52 55 5500 0100",
  },
  {
    id: "U002",
    name: "Carlos Mendoza",
    email: "carlos@pemex.com",
    role: "user",
    company: "PEMEX Exploración",
    phone: "+52 55 9000 4321",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string): boolean => {
    const found = mockUsers.find((u) => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}