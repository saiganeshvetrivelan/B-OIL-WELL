import { CSSCycle } from './types';

export const DEMO_CSS_CYCLES: CSSCycle[] = Array.from({ length: 14 }, (_, i) => {
  const cycleNum = i + 1;
  const baseDate = new Date(2026, 0, 1);
  baseDate.setDate(baseDate.getDate() + i * 18); // ~18 days per cycle
  
  const injDuration = 24 + Math.round(Math.sin(i * 0.7) * 8); // 16-32 hours
  const soakDuration = 2 + Math.round(Math.cos(i * 0.5) * 1); // 1-3 days
  const prodDuration = 10 + Math.round(Math.sin(i * 0.3) * 4); // 6-14 days
  const steamVol = 80 + Math.round(Math.sin(i * 0.4) * 20); // 60-100 units
  const steamTemp = 260 + Math.round(Math.cos(i * 0.6) * 30); // 230-290 °C
  const oilProduced = 1200 + Math.round(Math.sin(i * 0.8) * 500) - i * 30; // declining trend
  
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + Math.ceil(injDuration / 24) + soakDuration + prodDuration);
  
  return {
    cycleNumber: cycleNum,
    phase: i === 13 ? 'production' as const : (i % 3 === 0 ? 'injection' as const : i % 3 === 1 ? 'soaking' as const : 'production' as const),
    steamVolume: steamVol,
    steamTemp: steamTemp,
    injectionDuration: injDuration,
    soakDuration: soakDuration,
    productionDuration: prodDuration,
    oilProduced: Math.max(500, oilProduced),
    startDate: baseDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
});
