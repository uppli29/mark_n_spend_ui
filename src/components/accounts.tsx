import { useState, useEffect, useCallback } from 'react';
import { Plus, CreditCard, Building2, Trash2, Loader2 } from 'lucide-react';
import { AddAccountModal } from './add-account-modal';
import { Account } from '../services/accounts-service';
import { getExpenses, Expense } from '../services/expenses-service';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: (account: { name: string; type: 'BANK' | 'CARD' }) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
}

interface AccountStats {
  totalExpenses: number;
  expenseCount: number;
}

export function Accounts({ accounts, onAddAccount, onDeleteAccount }: AccountsProps) {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [accountStats, setAccountStats] = useState<Map<string, AccountStats>>(new Map());
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch expenses to calculate stats per account
  const fetchAccountStats = useCallback(async () => {
    if (accounts.length === 0) {
      setIsLoadingStats(false);
      return;
    }

    setIsLoadingStats(true);
    try {
      // Fetch all expenses to calculate per-account stats
      const expenses = await getExpenses({ limit: 500 });

      const stats = new Map<string, AccountStats>();
      accounts.forEach(account => {
        const accountExpenses = expenses.filter((exp: Expense) => exp.account_id === account.id);
        const totalExpenses = accountExpenses.reduce((sum: number, exp: Expense) => {
          const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(String(exp.amount));
          return sum + amount;
        }, 0);

        stats.set(account.id, {
          totalExpenses,
          expenseCount: accountExpenses.length,
        });
      });

      setAccountStats(stats);
    } catch (error) {
      console.error('Failed to fetch account stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [accounts]);

  useEffect(() => {
    fetchAccountStats();
  }, [fetchAccountStats]);

  const getAccountStats = (accountId: string): AccountStats => {
    return accountStats.get(accountId) || { totalExpenses: 0, expenseCount: 0 };
  };

  const handleDeleteAccount = async (id: string) => {
    const stats = getAccountStats(id);
    if (stats.expenseCount > 0) {
      if (!window.confirm(`This account has ${stats.expenseCount} expense(s). Deleting this account will also delete all associated expenses. Are you sure?`)) {
        return;
      }
    }

    setDeletingId(id);
    try {
      await onDeleteAccount(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground">Accounts</h1>
        <button
          onClick={() => setIsAddAccountOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-card border border-border rounded-lg shadow p-12 text-center">
          <p className="text-muted-foreground mb-4">No accounts yet</p>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your First Account
          </button>
        </div>
      ) : isLoadingStats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const stats = getAccountStats(account.id);
            const isDeleting = deletingId === account.id;

            return (
              <div
                key={account.id}
                className="bg-card border border-border rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${account.type === 'BANK'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                        }`}>
                        {account.type === 'BANK' ? (
                          <Building2 className="w-6 h-6 text-white" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-foreground">{account.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded mt-1 ${account.type === 'BANK'
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'
                          }`}>
                          {account.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                      aria-label="Delete account"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div>
                      <p className="text-muted-foreground">Total Expenses</p>
                      <p className="text-red-600">${stats.totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">
                        {stats.expenseCount} expense{stats.expenseCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAddAccountOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountOpen(false)}
          onAdd={onAddAccount}
        />
      )}
    </div>
  );
}