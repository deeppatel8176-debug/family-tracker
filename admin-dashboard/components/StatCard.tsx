import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
}: StatCardProps) {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      icon: 'text-rose-600',
      border: 'border-rose-100',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      icon: 'text-slate-600',
      border: 'border-slate-200',
    },
  }[variant];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className={`p-2.5 rounded-xl border ${variantStyles.bg} ${variantStyles.border}`}>
        <Icon className={`w-5 h-5 ${variantStyles.icon}`} />
      </div>
    </div>
  );
}
