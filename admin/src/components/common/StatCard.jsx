import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'green', trend }) {
  const colors = {
    green:  'bg-brand-50  text-brand-700  border-brand-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue:   'bg-blue-50   text-blue-600   border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red:    'bg-red-50    text-red-600    border-red-100',
  };
  const iconBg = {
    green:  'bg-brand-100  text-brand-700',
    orange: 'bg-orange-100 text-orange-600',
    blue:   'bg-blue-100   text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    red:    'bg-red-100    text-red-600',
  };

  return (
    <div className={cn('rounded-2xl border bg-white p-5 flex items-start gap-4', colors[color])}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="font-display text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs font-medium mt-1', trend > 0 ? 'text-green-600' : 'text-red-500')}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}