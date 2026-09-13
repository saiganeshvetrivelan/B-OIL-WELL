/**
 * Petroleum Engineering Calculation Engine for Baghewala Heavy Oil CSS & SRP Digital Twin.
 * Deterministic physics-inspired relationships linking steam enthalpy, thermal diffusion,
 * Andrade viscosity reduction, heat retention, and artificial lift energy.
 */

export interface ReservoirConditions {
  oilViscosity: number;     // cP (e.g. 500 - 15000 cP)
  reservoirTemp: number;    // °C (e.g. 35 - 80 °C)
  reservoirPressure: number;// bar (e.g. 15 - 60 bar)
  permeability: number;     // mD (e.g. 50 - 2500 mD)
}

export interface CSSParameters {
  steamTemperature: number; // °C (e.g. 220 - 340 °C)
  steamInjectionRate: number; // tons/day (e.g. 50 - 130 t/d)
  steamPressure: number;    // bar (e.g. 30 - 90 bar)
  steamInjectionTime: number; // hours (e.g. 12 - 96 hours)
  soakingTime: number;      // hours (e.g. 24 - 120 hours / 1 - 5 days)
}

export interface SRPParameters {
  pumpSpeed: number;        // SPM (e.g. 3.0 - 10.0 SPM)
  strokeLength: number;     // m (e.g. 1.2 - 3.2 m)
  pumpEfficiency: number;   // % (e.g. 45 - 95%)
}

export interface SimulationResultOutputs {
  finalReservoirTemp: number;    // °C
  reducedOilViscosity: number;    // cP
  heatDelivered: number;          // GJ
  steamUsed: number;              // tons
  heatRetained: number;           // GJ
  heatRetentionPercentage: number;// %
  soakingTimeUsed: number;        // hours & days formatted
  soakingTimeHours: number;       // hours
  estimatedEnergyConsumption: number; // kWh
  productionRate: number;         // bbl/day
}

export interface AIFieldConditions {
  oilViscosity: number;     // cP (e.g. 1000 - 12000 cP)
  reservoirTemp: number;    // °C (e.g. 40 - 75 °C)
  reservoirPressure: number;// bar (e.g. 20 - 55 bar)
  currentOilProduction: number; // bbl/d (e.g. 15 - 80 bbl/d)
}

export interface AIRecommendedSettings {
  css: {
    steamTemperature: number; // °C
    steamInjectionRate: number; // tons/day
    steamPressure: number;    // bar
    steamInjectionTime: number; // hours
    soakingTime: number;      // hours
    soakingTimeDays: number;  // days
  };
  srp: {
    pumpSpeed: number;        // SPM
    strokeLength: number;     // m
    pumpEfficiency: number;   // %
  };
}

/**
 * Calculate Trial & Error Simulation Results from inputs
 */
export function calculateTrialAndErrorResults(
  res: ReservoirConditions,
  css: CSSParameters,
  srp: SRPParameters
): SimulationResultOutputs {
  // 1. Steam Used = Injection Rate * (Injection Time / 24)
  const steamUsed = (css.steamInjectionRate * (css.steamInjectionTime / 24));

  // 2. Specific Enthalpy of Saturated/Superheated Steam (~2.75 MJ/kg at 280°C, 55 bar)
  const baseEnthalpyMJPerKg = 2.4 + ((css.steamTemperature - 200) / 100) * 0.4 + ((css.steamPressure - 30) / 60) * 0.15;
  
  // Heat Delivered in GJ = steam (tons) * 1000 kg/ton * Enthalpy (MJ/kg) / 1000
  const heatDelivered = Math.round(steamUsed * baseEnthalpyMJPerKg * 10) / 10;

  // 3. Reservoir Thermal Absorption & Temperature Rise
  // Thermal capacity factor + permeability convective dispersion factor
  const permFactor = Math.min(1.25, Math.max(0.75, 0.85 + (res.permeability / 1500) * 0.3));
  const tempRiseFactor = (heatDelivered / 220) * permFactor;
  const tempIncrease = Math.min(145, Math.max(25, 65 * tempRiseFactor));
  const finalReservoirTemp = Math.round((res.reservoirTemp + tempIncrease) * 10) / 10;

  // 4. Soaking Heat Retention & Viscosity Reduction (Andrade Model)
  // Optimal soaking window is ~72-96 hours. Over-soaking causes thermal dissipation to caprock.
  const soakOptimumHours = 72;
  const soakEfficiency = Math.max(0.55, 1.0 - Math.abs(css.soakingTime - soakOptimumHours) * 0.0035);
  const heatRetainedPct = Math.round((70 + soakEfficiency * 22) * 10) / 10;
  const heatRetained = Math.round((heatDelivered * (heatRetainedPct / 100)) * 10) / 10;

  // Exponential viscosity reduction factor: mu(T) = mu0 * exp(-b * (T_final - T_initial))
  const b = 0.032; // thermal thinning coefficient for Baghewala heavy oil
  const tempDelta = finalReservoirTemp - res.reservoirTemp;
  const rawReducedViscosity = res.oilViscosity * Math.exp(-b * tempDelta * soakEfficiency);
  const reducedOilViscosity = Math.max(12, Math.round(rawReducedViscosity * 10) / 10);

  // 5. Production Response
  const viscosityMobilityMultiplier = Math.min(3.5, Math.max(0.8, 1200 / Math.max(30, reducedOilViscosity)));
  const kinematicDisplacement = (srp.pumpSpeed * 14) * (srp.strokeLength / 2.0) * (srp.pumpEfficiency / 100);
  const productionRate = Math.round(Math.min(480, Math.max(45, (kinematicDisplacement * 0.75 + 60) * viscosityMobilityMultiplier * 0.7)) * 10) / 10;

  // 6. Estimated Energy Consumption (Steam boiler fuel energy + SRP electric motor work)
  const steamGenerationEnergyKWh = steamUsed * 78; // kWh thermal equivalent per ton
  const srpLiftWorkKWh = (srp.pumpSpeed * srp.strokeLength * 3.2 * 24) * (100 / Math.max(50, srp.pumpEfficiency));
  const estimatedEnergyConsumption = Math.round(steamGenerationEnergyKWh + srpLiftWorkKWh);

  return {
    finalReservoirTemp,
    reducedOilViscosity,
    heatDelivered,
    steamUsed: Math.round(steamUsed * 10) / 10,
    heatRetained,
    heatRetentionPercentage: heatRetainedPct,
    soakingTimeUsed: css.soakingTime,
    soakingTimeHours: css.soakingTime,
    estimatedEnergyConsumption,
    productionRate,
  };
}

/**
 * Calculate AI Recommended Settings from Current Field Conditions
 */
export function calculateAIRecommendations(field: AIFieldConditions): {
  recommendedSettings: AIRecommendedSettings;
  simulatedOutput: SimulationResultOutputs;
} {
  // Deterministic AI Optimization based on Heavy Oil physics:
  // 1. Steam Temp: Higher viscosity needs higher temperature
  const viscRatio = Math.min(1.0, field.oilViscosity / 10000);
  const steamTemperature = Math.round(270 + viscRatio * 45); // 270 - 315 °C

  // 2. Steam Rate: Scaled with current reservoir deficit
  const steamInjectionRate = Math.round(80 + viscRatio * 25); // 80 - 105 t/d

  // 3. Steam Pressure: Maintained at reservoir pressure + 25-30 bar injection overpressure
  const steamPressure = Math.round(field.reservoirPressure + 28); // e.g. 48 - 75 bar

  // 4. Steam Injection Time: Standard optimal cycle duration
  const steamInjectionTime = Math.round(48 + viscRatio * 24); // 48 - 72 hours (2 - 3 days)

  // 5. Soaking Time: Calculated optimal duration for thermal conductivity diffusion
  const soakingTimeDays = Math.round((2.5 + viscRatio * 1.5) * 2) / 2; // 2.5 - 4.0 days
  const soakingTime = Math.round(soakingTimeDays * 24); // hours

  // 6. SRP Pumping Parameters
  const pumpSpeed = Math.round((5.5 + (1 - viscRatio) * 1.5) * 2) / 2; // 5.5 - 7.0 SPM
  const strokeLength = 2.4; // standard optimum 2.4m stroke
  const pumpEfficiency = 82;

  const recommendedSettings: AIRecommendedSettings = {
    css: {
      steamTemperature,
      steamInjectionRate,
      steamPressure,
      steamInjectionTime,
      soakingTime,
      soakingTimeDays,
    },
    srp: {
      pumpSpeed,
      strokeLength,
      pumpEfficiency,
    },
  };

  const simulatedOutput = calculateTrialAndErrorResults(
    {
      oilViscosity: field.oilViscosity,
      reservoirTemp: field.reservoirTemp,
      reservoirPressure: field.reservoirPressure,
      permeability: 850,
    },
    {
      steamTemperature,
      steamInjectionRate,
      steamPressure,
      steamInjectionTime,
      soakingTime,
    },
    {
      pumpSpeed,
      strokeLength,
      pumpEfficiency,
    }
  );

  return { recommendedSettings, simulatedOutput };
}
