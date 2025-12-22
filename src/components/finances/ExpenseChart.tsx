import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ExpenseByCategory } from '@/hooks/useFinances';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(270, 91%, 75%)',
  'hsl(174, 72%, 50%)',
  'hsl(217, 91%, 60%)',
  'hsl(0, 84%, 60%)',
];

const categoryLabels: Record<string, string> = {
  travel: 'Travel',
  equipment: 'Equipment',
  rehearsal: 'Rehearsal',
  accommodation: 'Stay',
  food: 'Food',
  other: 'Other',
};

interface ExpenseChartProps {
  data: ExpenseByCategory[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = data.map((item, index) => ({
    name: categoryLabels[item.category] || item.category,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  }));

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No expenses recorded
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
