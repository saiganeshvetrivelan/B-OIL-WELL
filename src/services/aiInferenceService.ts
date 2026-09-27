/**
 * AI Telemetry Inference Service
 * Powered by Qwen 3.8 27B via OpenRouter
 * Provides formal, concise petroleum engineering surveillance inference from real telemetry data.
 */

export interface TelemetryInferenceInput {
  wellId?: string;
  field?: string;
  cssPhase: string;
  cycleNumber?: number;
  oilRate: number; // bbl/d
  reservoirTemp: number; // °C
  pumpEfficiency: number; // %
  srpSpeed: number; // SPM
  strokeLength: number; // m
  steamRate: number; // t/cyc
  steamTemperature?: number; // °C
  fluidLevel: number; // m
  waterCut?: number; // %
  wellheadPressure?: number; // psi
  gasRate?: number; // MSCF/d
  equipmentRisk: string;
  pumpCondition?: string;
  isRealTelemetry: boolean;
  recordedAt?: string | null;
}

export interface AIInferenceResult {
  assessment: string;
  regime: string;
  recommendations: string[];
  statusLevel: 'OPTIMAL' | 'STABLE' | 'ATTENTION' | 'CRITICAL';
  confidenceScore: number;
  model: string;
  latencyMs: number;
  timestamp: string;
  isRealTelemetry: boolean;
  cached?: boolean;
}

const DEFAULT_API_KEY = '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';
const DEFAULT_MODEL = 'qwen/qwen3.8-27b';

export function getOpenRouterApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('openrouter_api_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_OPENROUTER_API_KEY || DEFAULT_API_KEY;
}

export function setOpenRouterApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openrouter_api_key', key.trim());
  }
}

export function getOpenRouterModel(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('openrouter_model');
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL;
}

export function setOpenRouterModel(model: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openrouter_model', model.trim());
  }
}

/**
 * Generate heuristic engineering inference when offline or if API errors occur.
 */
function generateHeuristicInference(
  data: TelemetryInferenceInput,
  latencyMs: number,
  reason?: string
): AIInferenceResult {
  const isHealthyEfficiency = data.pumpEfficiency >= 75;
  const isOptimalTemp = data.reservoirTemp >= 120 && data.reservoirTemp <= 170;
  const isLowRisk = data.equipmentRisk.toLowerCase() === 'low';

  let statusLevel: 'OPTIMAL' | 'STABLE' | 'ATTENTION' | 'CRITICAL' = 'STABLE';
  if (isHealthyEfficiency && isOptimalTemp && isLowRisk) {
    statusLevel = 'OPTIMAL';
  } else if (!isLowRisk || data.pumpEfficiency < 60) {
    statusLevel = 'ATTENTION';
  }

  const assessment = `Well ${data.wellId || 'BGW-01'} exhibits ${
    statusLevel === 'OPTIMAL' ? 'robust' : 'controlled'
  } cyclic production at ${data.oilRate.toFixed(1)} bbl/d, sustained by an in-situ reservoir temperature of ${data.reservoirTemp.toFixed(0)}°C. Pump volumetric efficiency is benchmarked at ${data.pumpEfficiency.toFixed(0)}% under a ${data.srpSpeed.toFixed(1)} SPM rod frequency, indicating ${
    data.pumpEfficiency >= 75 ? 'favorable chamber fillage with nominal mechanical friction' : 'moderate volumetric slippage requiring continuous load cell surveillance'
  }.`;

  const recommendations = [
    data.pumpEfficiency < 75
      ? `Adjust SRP cadence from ${data.srpSpeed.toFixed(1)} SPM toward ${(data.srpSpeed - 0.5).toFixed(1)} SPM to eliminate potential fluid pound and optimize pump fillage.`
      : `Maintain current SRP operating setpoint at ${data.srpSpeed.toFixed(1)} SPM and ${data.strokeLength.toFixed(1)}m stroke length within the optimal production envelope.`,
    data.reservoirTemp < 110
      ? `Reservoir temperature (${data.reservoirTemp.toFixed(0)}°C) is approaching thermal dissipation threshold; schedule thermal survey for subsequent CSS cycle planning.`
      : `Thermal sweep profile remains effective at ${data.reservoirTemp.toFixed(0)}°C; maintain surface wellhead choke setting and monitor water cut trends.`
  ];

  return {
    assessment,
    regime: statusLevel === 'OPTIMAL' ? 'Optimal Thermal Lift Envelope' : 'Stable CSS Lift Surveillance',
    recommendations,
    statusLevel,
    confidenceScore: 91,
    model: `${getOpenRouterModel()} (Heuristic Fallback${reason ? `: ${reason}` : ''})`,
    latencyMs,
    timestamp: new Date().toISOString(),
    isRealTelemetry: data.isRealTelemetry,
  };
}

// In-memory cache to prevent redundant re-fetching for identical telemetry snapshots
let lastCacheKey = '';
let lastCachedResult: AIInferenceResult | null = null;

function computeCacheKey(data: TelemetryInferenceInput): string {
  return [
    data.wellId || 'BGW-01',
    data.cssPhase,
    data.oilRate.toFixed(1),
    data.reservoirTemp.toFixed(0),
    data.pumpEfficiency.toFixed(0),
    data.srpSpeed.toFixed(1),
    data.strokeLength.toFixed(1),
    data.fluidLevel.toFixed(0),
    data.equipmentRisk,
  ].join('|');
}

/**
 * Fetch formal AI inference from real telemetry data using Qwen 3.8 27B on OpenRouter.
 */
export async function generateTelemetryInference(
  data: TelemetryInferenceInput,
  options: { forceRefresh?: boolean } = {}
): Promise<AIInferenceResult> {
  const cacheKey = computeCacheKey(data);
  const now = Date.now();

  if (!options.forceRefresh && lastCachedResult && lastCacheKey === cacheKey) {
    return { ...lastCachedResult, cached: true };
  }

  const startTime = performance.now();
  const apiKey = getOpenRouterApiKey();
  const model = getOpenRouterModel();

  const systemPrompt = `You are a Senior Petroleum Production Surveillance AI for heavy oil assets operating under Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP) at the Baghewala Field (Oil India Limited).
Evaluate the provided real-time well telemetry with rigorous, formal engineering precision.
Your tone must be authoritative, objective, concise, and technical, adhering to SPE petroleum engineering standards.
Do NOT use conversational filler, pleasantries, or preamble.
Respond ONLY with a valid JSON object matching this schema:
{
  "assessment": "Formal 2-sentence executive diagnostic evaluating thermal sweep, artificial lift dynamics, and downhole mechanical condition.",
  "regime": "Concise operational regime classification (3-5 words, e.g., 'Stable Thermal Lift Envelope', 'Suboptimal Volumetric Fill Regime', 'Thermal Dissipation Margin')",
  "recommendations": [
    "Formal actionable directive regarding SRP pump speed, stroke, or mechanical setpoint",
    "Formal actionable directive regarding thermal surveillance, fluid level, or steam injection cycle"
  ],
  "statusLevel": "OPTIMAL" | "STABLE" | "ATTENTION" | "CRITICAL",
  "confidenceScore": 92
}`;

  const userPrompt = `Real-Time SCADA Telemetry Stream:
- Asset: Baghewala Field, Well ${data.wellId || 'BGW-01'}
- Operating Mode: ${data.isRealTelemetry ? 'Live SCADA Telemetry' : 'Operational Twin State'}
- CSS Phase: ${data.cssPhase.toUpperCase()}${data.cycleNumber ? ` (Cycle #${data.cycleNumber})` : ''}
- Gross/Oil Production Rate: ${data.oilRate.toFixed(1)} bbl/d
- Reservoir Bottomhole Temperature: ${data.reservoirTemp.toFixed(1)} °C
- Pump Volumetric Efficiency: ${data.pumpEfficiency.toFixed(1)} %
- SRP Unit Speed: ${data.srpSpeed.toFixed(1)} SPM
- Polished Rod Stroke Length: ${data.strokeLength.toFixed(1)} m
- Dynamic Acoustic Fluid Level: ${data.fluidLevel.toFixed(1)} m
- Steam Injection Rate: ${data.steamRate.toFixed(0)} t/cyc${data.steamTemperature ? ` @ ${data.steamTemperature.toFixed(0)} °C` : ''}
${data.wellheadPressure ? `- Wellhead Tubing Pressure: ${data.wellheadPressure.toFixed(0)} psi\n` : ''}${data.waterCut ? `- Water Cut: ${data.waterCut.toFixed(1)} %\n` : ''}${data.gasRate ? `- Associated Gas Rate: ${data.gasRate.toFixed(1)} MSCF/d\n` : ''}- Equipment Risk Rating: ${data.equipmentRisk.toUpperCase()}${data.pumpCondition ? ` (Condition: ${data.pumpCondition.toUpperCase()})` : ''}
- Telemetry Timestamp: ${data.recordedAt || new Date().toISOString()}

Generate the concise, formal petroleum engineering assessment in JSON.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://oil-well-digital-twin.local',
        'X-Title': 'Oil Well Digital Twin Surveillance',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        reasoning: { max_tokens: 0 },
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[AIInference] OpenRouter responded with ${response.status}: ${errText}`);
      const fallback = generateHeuristicInference(data, elapsed, `HTTP ${response.status}`);
      lastCacheKey = cacheKey;
      lastCachedResult = fallback;
      return fallback;
    }

    const json = await response.json();
    const rawContent: string = json.choices?.[0]?.message?.content || '';

    // Strip Markdown ```json and ``` wrapping if present
    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const validLevels = ['OPTIMAL', 'STABLE', 'ATTENTION', 'CRITICAL'] as const;
    const rawLevel = String(parsed.statusLevel || 'STABLE').toUpperCase();
    const statusLevel = validLevels.includes(rawLevel as any)
      ? (rawLevel as 'OPTIMAL' | 'STABLE' | 'ATTENTION' | 'CRITICAL')
      : 'STABLE';

    const result: AIInferenceResult = {
      assessment: parsed.assessment || 'Telemetry surveillance evaluation successfully completed.',
      regime: parsed.regime || 'Stable CSS Lift Surveillance',
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
        ? parsed.recommendations
        : [
            `Maintain SRP speed at ${data.srpSpeed.toFixed(1)} SPM under active monitoring.`,
            `Continue periodic acoustic fluid level surveillance.`
          ],
      statusLevel,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 94,
      model,
      latencyMs: elapsed,
      timestamp: new Date().toISOString(),
      isRealTelemetry: data.isRealTelemetry,
      cached: false,
    };

    lastCacheKey = cacheKey;
    lastCachedResult = result;
    return result;
  } catch (error: any) {
    const elapsed = Math.round(performance.now() - startTime);
    console.error('[AIInference] Error calling OpenRouter inference:', error);
    const fallback = generateHeuristicInference(data, elapsed, error.message || 'Network');
    lastCacheKey = cacheKey;
    lastCachedResult = fallback;
    return fallback;
  }
}

/**
 * Ping test function for verifying OpenRouter API connectivity
 */
export async function testOpenRouterConnection(apiKey?: string, model?: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const key = apiKey || getOpenRouterApiKey();
  const mod = model || getOpenRouterModel();
  const start = performance.now();

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: mod,
        max_tokens: 30,
        reasoning: { max_tokens: 0 },
        messages: [{ role: 'user', content: 'Respond with OK.' }],
      }),
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const err = await res.text();
      return { success: false, latencyMs, message: `Error ${res.status}: ${err}` };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'OK';
    return { success: true, latencyMs, message: `Connected to ${mod}: "${reply.trim()}"` };
  } catch (err: any) {
    return { success: false, latencyMs: Math.round(performance.now() - start), message: err.message || 'Failed to connect' };
  }
}
