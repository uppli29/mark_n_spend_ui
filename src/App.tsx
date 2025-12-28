import { useState, useEffect } from 'react';
import { Dashboard } from './components/dashboard';
import { Expenses } from './components/expenses';
import { Accounts } from './components/accounts';
import { AuthPage } from './components/auth/auth-page';
import { AuthProvider, useAuth } from './components/auth/auth-context';
import { LayoutDashboard, Receipt, Wallet, Moon, Sun, LogOut } from 'lucide-react';

export interface Account {
  id: string;
  name: string;
  type: 'BANK' | 'CARD';
  balance: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  accountId: string;
}

function AppContent() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'accounts'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenses');
    const storedAccounts = localStorage.getItem('accounts');

    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }

    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    } else {
      // Initialize with default accounts
      const defaultAccounts: Account[] = [
        { id: '1', name: 'Chase Checking', type: 'BANK', balance: 5000 },
        { id: '2', name: 'Visa Credit Card', type: 'CARD', balance: 0 },
      ];
      setAccounts(defaultAccounts);
      localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts([...accounts, newAccount]);
  };

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
    setExpenses(expenses.filter(exp => exp.accountId !== id));
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(accounts.map(acc =>
      acc.id === id ? { ...acc, ...updates } : acc
    ));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses' as const, label: 'Expenses', icon: Receipt },
    { id: 'accounts' as const, label: 'Accounts', icon: Wallet },
  ];

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-blue-600" />
              <span className="text-foreground">Expense Tracker</span>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-muted-foreground text-sm hidden md:inline">
                  {user.email}
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <div className="flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <Dashboard expenses={expenses} accounts={accounts} onAddExpense={addExpense} />
        )}
        {activeTab === 'expenses' && (
          <Expenses
            expenses={expenses}
            accounts={accounts}
            onDeleteExpense={deleteExpense}
          />
        )}
        {activeTab === 'accounts' && (
          <Accounts
            accounts={accounts}
            expenses={expenses}
            onAddAccount={addAccount}
            onDeleteAccount={deleteAccount}
            onUpdateAccount={updateAccount}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}