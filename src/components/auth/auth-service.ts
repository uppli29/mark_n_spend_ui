// Auth API service for authentication endpoints
const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface LoginCredentials {
    username: string;  // Backend expects username (email) for OAuth2
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    timezone: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface User {
    id: string;
    email: string;
    timezone: string;
    created_at: string;
}

export interface AuthError {
    detail: string;
}

/**
 * Login user and get access tokens
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthTokens> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });

    if (!response.ok) {
        const error: AuthError = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    return response.json();
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error: AuthError = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error: AuthError = await response.json();
        throw new Error(error.detail || 'Token refresh failed');
    }

    return response.json();
}
