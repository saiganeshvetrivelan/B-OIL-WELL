import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  let badgeVariant = variant;

  if (!badgeVariant) {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('stable') || s.includes('operational') || s.includes('good') || s.includes('excellent')) badgeVariant = 'success';
    else if (s.includes('warning') || s.includes('fair') || s.includes('soaking')) badgeVariant = 'warning';
    else if (s.includes('error') || s.includes('critical') || s.includes('poor')) badgeVariant = 'error';
    else if (s.includes('injection') || s.includes('simulated')) badgeVariant = 'info';
    else badgeVariant = 'neutral';
  }

  const colors = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dot-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dot-amber-500',
    error: 'bg-red-500/10 text-red-500 border-red-500/20 dot-red-500',
    info: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 dot-cyan-400',
    neutral: 'bg-gray-500/10 text-gray-500 border-gray-500/20 dot-gray-500',
  };

  const style = colors[badgeVariant] || colors.neutral;

  return (
    <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${style.split(' dot-')[0]}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${style.split('dot-')[1]}`}></div>
      <span className="uppercase tracking-wider">{status}</span>
    </div>
  );
}
