import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Expense, Account } from '../App';

interface ExpensesProps {
  expenses: Expense[];
  accounts: Account[];
  onDeleteExpense: (id: string) => void;
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

export function Expenses({ expenses, accounts, onDeleteExpense }: ExpensesProps) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  const filteredExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date + 'T00:00:00');
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    const inDateRange = expDate >= start && expDate <= end;
    const matchesAccount = selectedAccountId === 'all' || exp.accountId === selectedAccountId;
    
    return inDateRange && matchesAccount;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getChartData = () => {
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const chartData = getChartData();
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'Unknown Account';
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
        {chartData.length > 0 ? (
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
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
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
          <p className="text-muted-foreground mt-1">{sortedExpenses.length} expenses</p>
        </div>
        <div className="divide-y divide-border">
          {sortedExpenses.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No expenses found for the selected date range and account
            </div>
          ) : (
            sortedExpenses.map((expense) => (
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
                  <div className="flex items-center gap-4">
                    <span className="text-foreground whitespace-nowrap">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-2"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}