import { ProductionRecord } from './types';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function generateProductionHistory(days: number = 90): ProductionRecord[] {
  const records: ProductionRecord[] = [];
  const now = new Date();
  
  for (let d = days; d >= 0; d--) {
    for (let h = 0; h < 24; h += 4) { // every 4 hours
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(h, 0, 0, 0);
      
      const seed = d * 100 + h;
      const cycleFactor = Math.sin((days - d) * 0.035) * 0.15 + 1; // CSS cycle effect
      const declineFactor = 1 - d * 0.0005; // slight decline
      const noise = (seededRandom(seed) - 0.5) * 0.1;
      
      records.push({
        timestamp: date.toISOString(),
        oilRate: Math.round((245 * cycleFactor * declineFactor + noise * 50) * 10) / 10,
        waterRate: Math.round((85 + seededRandom(seed + 1) * 30) * 10) / 10,
        gasRate: Math.round((12 + seededRandom(seed + 2) * 8) * 10) / 10,
        temperature: Math.round((118 + (seededRandom(seed + 3) - 0.5) * 20) * 10) / 10,
        pressure: Math.round((450 + (seededRandom(seed + 4) - 0.5) * 60) * 10) / 10,
      });
    }
  }
  return records;
}
