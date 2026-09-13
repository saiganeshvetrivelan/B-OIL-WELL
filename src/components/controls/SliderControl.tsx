import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

export default function SliderControl({ label, value, min, max, step, unit, onChange }: SliderControlProps) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-baseline mb-1.5">
        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</label>
        <div className="text-xs font-mono font-bold">
          <span className="text-amber-500">{value}</span>
          <span className="text-[var(--text-muted)] ml-1 font-normal">{unit}</span>
        </div>
      </div>
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
      <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-mono">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}
