import { useState } from 'react';
import { Plus, CreditCard, Building2, Trash2 } from 'lucide-react';
import { Account, Expense } from '../App';
import { AddAccountModal } from './add-account-modal';

interface AccountsProps {
  accounts: Account[];
  expenses: Expense[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
}

export function Accounts({ accounts, expenses, onAddAccount, onDeleteAccount }: AccountsProps) {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const getAccountExpenseTotal = (accountId: string) => {
    return expenses
      .filter(exp => exp.accountId === accountId)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getAccountExpenseCount = (accountId: string) => {
    return expenses.filter(exp => exp.accountId === accountId).length;
  };

  const handleDeleteAccount = (id: string) => {
    const expenseCount = getAccountExpenseCount(id);
    if (expenseCount > 0) {
      if (window.confirm(`This account has ${expenseCount} expense(s). Deleting this account will also delete all associated expenses. Are you sure?`)) {
        onDeleteAccount(id);
      }
    } else {
      onDeleteAccount(id);
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const totalExpenses = getAccountExpenseTotal(account.id);
            const expenseCount = getAccountExpenseCount(account.id);
            
            return (
              <div
                key={account.id}
                className="bg-card border border-border rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        account.type === 'BANK' 
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
                        <span className={`inline-block px-2 py-1 rounded mt-1 ${
                          account.type === 'BANK'
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}>
                          {account.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                      aria-label="Delete account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div>
                      <p className="text-muted-foreground">Initial Balance</p>
                      <p className="text-foreground">${account.balance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Expenses</p>
                      <p className="text-red-600">${totalExpenses.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Balance</p>
                      <p className="text-foreground">
                        ${(account.balance - totalExpenses).toFixed(2)}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">
                        {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
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