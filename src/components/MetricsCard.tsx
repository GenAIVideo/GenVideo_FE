import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export default function MetricsCard({
  title,
  value,
  icon,
  description,
  trend,
  loading = false,
}: MetricsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100"></div>
        </div>
        <div className="h-4 bg-slate-100 rounded w-2/3 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="text-slate-400 font-medium">{description}</span>}
        </div>
      )}
    </div>
  );
}
