import { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Account } from '../services/accounts-service';
import { Expense, getExpenses, deleteExpense as deleteExpenseApi } from '../services/expenses-service';
import { Category } from '../services/categories-service';

interface ExpensesProps {
  accounts: Account[];
  categories: Category[];
}

const COLORS: Record<string, string> = {
  Food: '#fb923c',
  Transportation: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Healthcare: '#10b981',
  Other: '#6b7280',
};

const DEFAULT_COLORS = ['#fb923c', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#10b981', '#6b7280', '#f59e0b', '#06b6d4'];

export function Expenses({ accounts, categories }: ExpensesProps) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create a map for category names
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId) || 'Unknown';
  };

  const getColor = (categoryName: string, index: number) => {
    return COLORS[categoryName] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  // Fetch expenses with filters from API
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string | number | undefined> = {
        from: startDate,
        to: endDate,
        limit: 500,
      };

      if (selectedAccountId !== 'all') {
        filters.account = selectedAccountId;
      }

      const data = await getExpenses(filters);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedAccountId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const getChartData = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryName = getCategoryName(expense.category_id);
      const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(String(expense.amount));
      acc[categoryName] = (acc[categoryName] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const chartData = getChartData();
  const totalAmount = expenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(String(exp.amount));
    return sum + amount;
  }, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'Unknown Account';
  };

  const handleDeleteExpense = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExpenseApi(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-foreground">Expenses</h1>

      <div className="bg-card border border-border rounded-lg shadow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-foreground mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-foreground mb-2">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
            />
          </div>

          <div>
            <label htmlFor="account" className="block text-foreground mb-2">
              Account
            </label>
            <select
              id="account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
            >
              <option value="all">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-foreground">Expense Breakdown</h2>
          <p className="text-muted-foreground mt-1">
            Total: ${totalAmount.toFixed(2)}
            {selectedAccountId !== 'all' && ` • ${getAccountName(selectedAccountId)}`}
          </p>
        </div>
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={getColor(entry.name, index)} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem' }} itemStyle={{ color: 'var(--foreground)' }} />
              <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No expenses found for the selected filters
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg shadow">
        <div className="p-6 border-b border-border">
          <h2 className="text-foreground">Expense List</h2>
          <p className="text-muted-foreground mt-1">{expenses.length} expenses</p>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No expenses found for the selected date range and account
            </div>
          ) : (
            expenses.map((expense) => {
              const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(String(expense.amount));
              const isDeleting = deletingId === expense.id;

              return (
                <div
                  key={expense.id}
                  className="p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-foreground">{expense.description || 'No description'}</span>
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                          {getCategoryName(expense.category_id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{formatDate(expense.expense_date)}</span>
                        <span>•</span>
                        <span>{getAccountName(expense.account_id)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-foreground whitespace-nowrap">
                        ${amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 transition-colors p-2 disabled:opacity-50"
                        aria-label="Delete expense"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}