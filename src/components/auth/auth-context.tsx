import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, AuthTokens, User, LoginCredentials, RegisterData } from './auth-service';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, timezone?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store tokens in memory for security
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const storedUser = localStorage.getItem('user');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedUser && storedRefreshToken) {
            try {
                setUser(JSON.parse(storedUser));
                refreshToken = storedRefreshToken;
            } catch {
                // Invalid stored data, clear it
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const credentials: LoginCredentials = {
            username: email,
            password,
        };

        const tokens: AuthTokens = await loginUser(credentials);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;

        // Decode user info from JWT (basic decode, not verification)
        const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
        const userData: User = {
            id: payload.sub,
            email: email,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            created_at: new Date().toISOString(),
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('refreshToken', tokens.refresh_token);
    };

    const register = async (email: string, password: string, timezone?: string) => {
        const data: RegisterData = {
            email,
            password,
            timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        await registerUser(data);
        // After successful registration, automatically log in
        await login(email, password);
    };

    const logout = () => {
        accessToken = null;
        refreshToken = null;
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function getAccessToken() {
    return accessToken;
}
