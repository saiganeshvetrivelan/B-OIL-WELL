import React from 'react';

interface SimulatedTagProps {
  label?: string;
}

export default function SimulatedTag({ label = 'SIMULATED' }: SimulatedTagProps) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-cyan-400 dark:text-cyan-400 font-semibold bg-cyan-400/10 px-1 py-0.5 rounded border border-cyan-400/20">
      {label}
    </span>
  );
}
