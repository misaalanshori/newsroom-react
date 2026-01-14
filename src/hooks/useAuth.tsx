import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: number;
    username: string;
    role: string;
    departmentId: number;
    exp: number;
}

interface AuthContextType {
    token: string | null;
    user: DecodedToken | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);
                // Check expiry (exp is in seconds, Date.now() is ms)
                if (decoded.exp * 1000 < Date.now()) {
                    // Token expired
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                } else {
                    // Token already in state, just set user
                    setUser(decoded);
                }
            } catch (e) {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(newToken);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(decoded);
            navigate('/');
        } catch (error) {
            console.error("Invalid token", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
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
