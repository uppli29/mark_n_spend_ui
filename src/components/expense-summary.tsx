import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Expense } from '../App';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date + 'T00:00:00');
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  }).reduce((sum, exp) => sum + exp.amount, 0);

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses
    .filter(exp => exp.date === today)
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-gray-900">Summary</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600">Total Expenses</p>
            <p className="text-gray-900">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-600">This Month</p>
            <p className="text-gray-900">${monthlyExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-600">Today</p>
            <p className="text-gray-900">${todayExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-gray-600 mb-2">Total Transactions</p>
        <p className="text-gray-900">{expenses.length}</p>
      </div>
    </div>
  );
}
