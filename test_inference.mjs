const testData = {
  wellId: 'BGW-01',
  cssPhase: 'production',
  cycleNumber: 14,
  oilRate: 165.4,
  reservoirTemp: 142.0,
  pumpEfficiency: 78.0,
  srpSpeed: 6.0,
  strokeLength: 2.0,
  steamRate: 80,
  steamTemperature: 280,
  fluidLevel: 50,
  wellheadPressure: 450,
  equipmentRisk: 'low',
  isRealTelemetry: true
};

const apiKey = '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';
const model = 'qwen/qwen3.8-27b';

const systemPrompt = `You are a Senior Petroleum Production Surveillance AI for heavy oil assets operating under Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP) at the Baghewala Field (Oil India Limited).
Evaluate the provided real-time well telemetry with rigorous, formal engineering precision.
Your tone must be authoritative, objective, concise, and technical.
Respond ONLY with a valid JSON object matching this schema:
{
  "assessment": "Formal 2-sentence executive diagnostic evaluating thermal sweep, artificial lift dynamics, and downhole mechanical condition.",
  "regime": "Concise operational regime classification (3-5 words, e.g., 'Stable Thermal Lift Envelope', 'Suboptimal Volumetric Fill Regime')",
  "recommendations": [
    "Formal actionable directive regarding SRP pump speed, stroke, or mechanical setpoint",
    "Formal actionable directive regarding thermal surveillance, fluid level, or steam injection cycle"
  ],
  "statusLevel": "OPTIMAL",
  "confidenceScore": 92
}`;

async function run() {
  const t0 = performance.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Oil Well Digital Twin'
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      reasoning: { max_tokens: 0 },
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Telemetry data:\n${JSON.stringify(testData, null, 2)}` }
      ]
    })
  });

  const duration = Math.round(performance.now() - t0);
  console.log('Status code:', res.status, `(${duration}ms)`);
  const data = await res.json();
  const content = data.choices[0].message.content;
  console.log('Content:\n', content);
  const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  console.log('Parsed successfully:', {
    regime: parsed.regime,
    statusLevel: parsed.statusLevel,
    confidenceScore: parsed.confidenceScore,
    recommendationsCount: parsed.recommendations?.length
  });
}

run().catch(console.error);
