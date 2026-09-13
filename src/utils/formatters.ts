import { RISK_COLORS, SEVERITY_COLORS } from './constants';

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatUnit = (value: number, unit: string, decimals: number = 2): string => {
  return `${formatNumber(value, decimals)} ${unit}`;
};

export const formatTimestamp = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d);
};

export const formatPercentage = (value: number): string => {
  return `${formatNumber(value, 1)}%`;
};

export const getRiskColor = (risk: string): string => {
  return RISK_COLORS[risk as keyof typeof RISK_COLORS] || '#6b7280';
};

export const getSeverityColor = (severity: string): string => {
  return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#6b7280';
};
