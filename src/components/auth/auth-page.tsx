import { useState, useEffect } from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { Wallet } from 'lucide-react';
import './auth-styles.css';

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    // Apply dark theme by default for auth page
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-brand">
                    <Wallet className="auth-brand-icon" />
                    <span className="auth-brand-name">Expense Tracker</span>
                </div>

                <div className="auth-card">
                    {isLogin ? (
                        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                    ) : (
                        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                    )}
                </div>

                <p className="auth-footer">
                    Track your expenses · Manage your finances · Stay in control
                </p>
            </div>
        </div>
    );
}
