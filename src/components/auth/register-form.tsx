import { useState, FormEvent } from 'react';
import { useAuth } from './auth-context';
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form-header">
                <div className="auth-icon-wrapper">
                    <UserPlus className="auth-icon" />
                </div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Start tracking your expenses today</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <div className="auth-input-group">
                    <label htmlFor="reg-email" className="auth-label">Email</label>
                    <div className="auth-input-wrapper">
                        <Mail className="auth-input-icon" />
                        <input
                            id="reg-email"
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
                    <label htmlFor="reg-password" className="auth-label">Password</label>
                    <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="auth-input"
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="confirm-password" className="auth-label">Confirm Password</label>
                    <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Creating account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="auth-switch">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="auth-switch-btn"
                >
                    Sign in
                </button>
            </div>
        </div>
    );
}
