import { Trash2, Filter } from 'lucide-react';
import { Expense } from '../App';

const CATEGORIES = ['all', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-800',
  Transportation: 'bg-blue-100 text-blue-800',
  Entertainment: 'bg-purple-100 text-purple-800',
  Shopping: 'bg-pink-100 text-pink-800',
  Bills: 'bg-red-100 text-red-800',
  Healthcare: 'bg-green-100 text-green-800',
  Other: 'bg-gray-100 text-gray-800',
};

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ExpenseList({ expenses, onDeleteExpense, selectedCategory, onCategoryChange }: ExpenseListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-gray-900">Recent Expenses</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No expenses found</p>
            <p className="mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${CATEGORY_COLORS[expense.category]}`}>
                    {expense.category}
                  </span>
                  <span className="text-gray-500">{formatDate(expense.date)}</span>
                </div>
                <p className="text-gray-900">{expense.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-900 whitespace-nowrap">
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
          ))
        )}
      </div>
    </div>
  );
}
