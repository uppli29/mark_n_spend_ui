import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Expense, Account } from '../App';
import { AddExpenseModal } from './add-expense-modal';

interface DashboardProps {
  expenses: Expense[];
  accounts: Account[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
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

export function Dashboard({ expenses, accounts, onAddExpense }: DashboardProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date + 'T00:00:00');
    return expDate >= startOfWeek;
  });

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date + 'T00:00:00');
    return expDate >= startOfMonth;
  });

  const getChartData = (expenseList: Expense[]) => {
    const categoryTotals = expenseList.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const weeklyData = getChartData(weeklyExpenses);
  const monthlyData = getChartData(monthlyExpenses);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'Unknown Account';
  };

  const weeklyTotal = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

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
                  {weeklyData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
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
                  {monthlyData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
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
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-foreground">{expense.description}</span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <span>{getAccountName(expense.accountId)}</span>
                    </div>
                  </div>
                  <div className="text-foreground">
                    ${expense.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isAddExpenseOpen && (
        <AddExpenseModal
          accounts={accounts}
          onClose={() => setIsAddExpenseOpen(false)}
          onAdd={onAddExpense}
        />
      )}
    </div>
  );
}