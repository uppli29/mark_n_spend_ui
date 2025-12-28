import { useState, FormEvent } from 'react';
import { useAuth } from './auth-context';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form-header">
                <div className="auth-icon-wrapper">
                    <LogIn className="auth-icon" />
                </div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to continue to Expense Tracker</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <div className="auth-input-group">
                    <label htmlFor="email" className="auth-label">Email</label>
                    <div className="auth-input-wrapper">
                        <Mail className="auth-input-icon" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="auth-input"
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="password" className="auth-label">Password</label>
                    <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="auth-input"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-submit-btn"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="auth-spinner" />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="auth-switch">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="auth-switch-btn"
                >
                    Create one
                </button>
            </div>
        </div>
    );
}
