import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AddExpenseModal } from './add-expense-modal';
import { Account } from '../services/accounts-service';
import { Expense, getExpenses, getExpenseSummary, ExpenseSummary } from '../services/expenses-service';
import { Category } from '../services/categories-service';

interface DashboardProps {
  accounts: Account[];
  categories: Category[];
  onAddExpense: (expense: {
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    accountId: string;
  }) => void;
  onExpenseAdded: () => void;
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

export function Dashboard({ accounts, categories, onAddExpense, onExpenseAdded }: DashboardProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<ExpenseSummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<ExpenseSummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create a map for category names
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId) || 'Unknown';
  };

  const getColor = (categoryName: string, index: number) => {
    return COLORS[categoryName] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  // Fetch dashboard data using optimized API calls
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weekly, monthly, recent] = await Promise.all([
        getExpenseSummary('weekly'),
        getExpenseSummary('monthly'),
        getExpenses({ limit: 10 }), // Only fetch 10 most recent
      ]);
      setWeeklySummary(weekly);
      setMonthlySummary(monthly);
      setRecentExpenses(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddExpense = async (expenseData: {
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    accountId: string;
  }) => {
    await onAddExpense(expenseData);
    onExpenseAdded();
    // Refresh dashboard data after adding expense
    fetchDashboardData();
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'Unknown Account';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Convert summary by_category to chart data
  const getChartDataFromSummary = (summary: ExpenseSummary | null) => {
    if (!summary) return [];
    return summary.by_category.map(cat => ({
      name: cat.category_name,
      value: typeof cat.total === 'number' ? parseFloat(cat.total.toFixed(2)) : parseFloat(String(cat.total)),
    }));
  };

  const weeklyData = getChartDataFromSummary(weeklySummary);
  const monthlyData = getChartDataFromSummary(monthlySummary);

  const weeklyTotal = weeklySummary ?
    (typeof weeklySummary.total === 'number' ? weeklySummary.total : parseFloat(String(weeklySummary.total))) : 0;
  const monthlyTotal = monthlySummary ?
    (typeof monthlySummary.total === 'number' ? monthlySummary.total : parseFloat(String(monthlySummary.total))) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground">Dashboard</h1>
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-foreground">Weekly Expenses</h2>
            <p className="text-muted-foreground mt-1">Total: ${weeklyTotal.toFixed(2)}</p>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={weeklyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={getColor(entry.name, index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expenses this week
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-foreground">Monthly Expenses</h2>
            <p className="text-muted-foreground mt-1">Total: ${monthlyTotal.toFixed(2)}</p>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={getColor(entry.name, index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expenses this month
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow">
        <div className="p-6 border-b border-border">
          <h2 className="text-foreground">Top 10 Recent Expenses</h2>
        </div>
        <div className="divide-y divide-border">
          {recentExpenses.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No expenses yet. Add your first expense to get started!
            </div>
          ) : (
            recentExpenses.map((expense) => {
              const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(String(expense.amount));
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
                    <div className="text-foreground">
                      ${amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isAddExpenseOpen && (
        <AddExpenseModal
          accounts={accounts}
          categories={categories}
          onClose={() => setIsAddExpenseOpen(false)}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
}