import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

interface DecodedToken {
    sub: number;
    username: string;
    role: string;
    departmentId: number;
    exp: number;
}

export interface Permission {
    resource: string;
    action: string;
    scope: string;
    ownership: string;
}

interface AuthContextType {
    token: string | null;
    user: DecodedToken | null;
    permissions: Permission[];
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
    can: (action: string, resource: string, requiredOwnership?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const fetchPermissions = useCallback(async () => {
        try {
            const response = await apiClient.get('/user/me');
            setPermissions(response.data.permissions || []);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
            // Don't log out here, just have empty permissions
        }
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setPermissions([]);
                } else {
                    setUser(decoded);
                    // Fetch permissions since we have a valid token
                    // We need to set the token in client header first? 
                    // The client interceptor uses localStorage, so provided it's there it works.
                    // But if this is initial load, we might race.
                    // Actually client.ts reads from localStorage every request, so we are good.
                    fetchPermissions();
                }
            } catch { // Changed from catch(e) to catch
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                setPermissions([]);
            }
        }
        setIsLoading(false);
    }, [fetchPermissions]);

    const login = (newToken: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(newToken);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(decoded);
            navigate('/');
            // Fetch permissions after login
            // We can call fetchPermissions() here immediatey since token is in LS
            setTimeout(fetchPermissions, 0);
        } catch (error) {
            console.error("Invalid token", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setPermissions([]);
        queryClient.removeQueries(); // Clear all queries
        navigate('/login');
    };

    const can = (action: string, resource: string, requiredOwnership?: string) => {
        return permissions.some(p =>
            p.resource === resource &&
            p.action === action &&
            (!requiredOwnership || p.ownership === requiredOwnership || p.ownership === 'any')
        );
    };

    return (
        <AuthContext.Provider value={{ token, user, permissions, login, logout, isLoading, can }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
