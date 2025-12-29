import { useState, FormEvent, useMemo } from 'react';
import { useAuth } from './auth-context';
import { Mail, Lock, Loader2, UserPlus, Check, X } from 'lucide-react';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

interface PasswordValidation {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Real-time password validation
    const passwordValidation: PasswordValidation = useMemo(() => ({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasDigit: /\d/.test(password),
    }), [password]);

    const isPasswordValid = useMemo(() =>
        passwordValidation.minLength &&
        passwordValidation.hasUppercase &&
        passwordValidation.hasLowercase &&
        passwordValidation.hasDigit,
        [passwordValidation]);

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
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

    const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
        <div className={`password-requirement ${valid ? 'valid' : 'invalid'}`}>
            {valid ? (
                <Check className="requirement-icon valid" size={14} />
            ) : (
                <X className="requirement-icon invalid" size={14} />
            )}
            <span>{text}</span>
        </div>
    );

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
                            className="auth-input"
                        />
                    </div>

                    {/* Password Requirements Checklist */}
                    {password.length > 0 && (
                        <div className="password-requirements">
                            <ValidationItem valid={passwordValidation.minLength} text="At least 8 characters" />
                            <ValidationItem valid={passwordValidation.hasUppercase} text="One uppercase letter" />
                            <ValidationItem valid={passwordValidation.hasLowercase} text="One lowercase letter" />
                            <ValidationItem valid={passwordValidation.hasDigit} text="One digit" />
                        </div>
                    )}
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

                    {/* Password Match Indicator */}
                    {confirmPassword.length > 0 && (
                        <div className={`password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
                            {passwordsMatch ? (
                                <>
                                    <Check className="requirement-icon valid" size={14} />
                                    <span>Passwords match</span>
                                </>
                            ) : (
                                <>
                                    <X className="requirement-icon invalid" size={14} />
                                    <span>Passwords do not match</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !isPasswordValid || !passwordsMatch}
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
