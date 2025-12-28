import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/dashboard';
import { Expenses } from './components/expenses';
import { Accounts } from './components/accounts';
import { AuthPage } from './components/auth/auth-page';
import { AuthProvider, useAuth } from './components/auth/auth-context';
import { LayoutDashboard, Receipt, Wallet, Moon, Sun, LogOut, Loader2 } from 'lucide-react';
import { getAccounts, createAccount, deleteAccount as deleteAccountApi, Account } from './services/accounts-service';
import { createExpense } from './services/expenses-service';
import { getCategories, Category } from './services/categories-service';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'accounts'>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // Default to dark theme
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch only accounts and categories (shared data)
  // Each page fetches its own expenses as needed
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingData(true);
    try {
      const [accountsData, categoriesData] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addExpense = async (expenseData: {
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    accountId: string;
  }) => {
    try {
      await createExpense({
        amount: expenseData.amount,
        category_id: expenseData.categoryId,
        account_id: expenseData.accountId,
        description: expenseData.description,
        expense_date: expenseData.date,
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const addAccount = async (accountData: { name: string; type: 'BANK' | 'CARD' }) => {
    try {
      const newAccount = await createAccount({
        name: accountData.name,
        type: accountData.type,
      });
      setAccounts([...accounts, newAccount]);
    } catch (error) {
      console.error('Failed to add account:', error);
      alert('Failed to add account. Please try again.');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccountApi(id);
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
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
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
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
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                accounts={accounts}
                categories={categories}
                onAddExpense={addExpense}
                onExpenseAdded={() => { }}
              />
            )}
            {activeTab === 'expenses' && (
              <Expenses
                accounts={accounts}
                categories={categories}
              />
            )}
            {activeTab === 'accounts' && (
              <Accounts
                accounts={accounts}
                onAddAccount={addAccount}
                onDeleteAccount={handleDeleteAccount}
                onUpdateAccount={updateAccount}
              />
            )}
          </>
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