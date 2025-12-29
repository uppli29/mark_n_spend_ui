import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Expense } from '../App';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from './ui/chart';

interface ExpenseChartProps {
  expenses: Expense[];
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

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const config = data.reduce((acc, item) => {
    acc[item.name] = { color: COLORS[item.name] };
    return acc;
  }, {} as Record<string, { color?: string }>);

  return (
    <div className="rounded-lg shadow p-6 bg-background">
      <h2 className="text-foreground mb-4">Spending by Category</h2>
      <ChartContainer id="expenses" config={config}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
            <ChartLegend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
