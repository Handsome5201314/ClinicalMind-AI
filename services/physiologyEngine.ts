
import { VitalsData } from '../types';

/**
 * Physiology Engine (Web Equivalent of Pulse Engine)
 * Handles the calculation of vital signs over time, including:
 * 1. Smooth transitions (Drift) towards target values set by the AI.
 * 2. Biological Noise (e.g. Respiratory Sinus Arrhythmia).
 * 3. Physiological coupling (Pain affecting HR variability).
 */
class PhysiologyEngine {
  // The current "true" physiological mean values
  private currentVitals: VitalsData;
  // The target values the AI wants the patient to reach
  private targetVitals: VitalsData;
  
  private lastUpdate: number;
  private noiseOffset: number = 0;

  constructor() {
    const initialVitals: VitalsData = {
      HR: 75,
      BP: "120/80",
      SpO2: 98,
      RR: 16,
      Temp: 37.0,
      Pain: 0
    };
    
    this.currentVitals = { ...initialVitals };
    this.targetVitals = { ...initialVitals };
    this.lastUpdate = Date.now();
  }

  /**
   * Sets the target state that the patient should drift towards.
   * Usually called when the AI outputs an UPDATE_VISUAL command.
   */
  public setTarget(vitals: Partial<VitalsData>) {
    this.targetVitals = { ...this.targetVitals, ...vitals };
    // Ensure Pain is updated instantly as it's a sensory input, not a metabolic lag
    if (vitals.Pain !== undefined) {
        this.currentVitals.Pain = vitals.Pain; 
    }
  }

  /**
   * Returns the current display values (with noise applied).
   */
  public getSnapshot(): VitalsData {
    // Generate instantaneous values based on current mean + physiological noise
    return {
      HR: Math.round(this.applyNoise(this.currentVitals.HR, 1.5 + (this.currentVitals.Pain * 0.2))),
      BP: this.currentVitals.BP, // BP noise handled in update for stability
      SpO2: Math.round(this.clamp(this.applyNoise(this.currentVitals.SpO2, 0.5), 0, 100)),
      RR: Math.round(this.currentVitals.RR),
      Temp: Number(this.currentVitals.Temp.toFixed(1)),
      Pain: this.currentVitals.Pain
    };
  }

  /**
   * Main simulation loop. Should be called periodically (e.g. every 100ms or 1s).
   */
  public update() {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000; // Delta time in seconds
    this.lastUpdate = now;
    this.noiseOffset += dt;

    // 1. Interpolate Values towards Target (Simulate physiological lag)
    
    // Heart Rate reacts relatively quickly
    this.currentVitals.HR = this.lerp(this.currentVitals.HR, this.targetVitals.HR, dt * 0.8);
    
    // SpO2 reacts slowly (lag in oxygenation)
    this.currentVitals.SpO2 = this.lerp(this.currentVitals.SpO2, this.targetVitals.SpO2, dt * 0.4);
    
    // RR changes moderately
    this.currentVitals.RR = this.lerp(this.currentVitals.RR, this.targetVitals.RR, dt * 0.6);
    
    // Temperature changes very slowly
    this.currentVitals.Temp = this.lerp(this.currentVitals.Temp, this.targetVitals.Temp, dt * 0.1);

    // Blood Pressure Interpolation
    const currBP = this.parseBP(this.currentVitals.BP);
    const targetBP = this.parseBP(this.targetVitals.BP);
    const nextSys = this.lerp(currBP.sys, targetBP.sys, dt * 0.5);
    const nextDia = this.lerp(currBP.dia, targetBP.dia, dt * 0.5);
    this.currentVitals.BP = this.formatBP(nextSys, nextDia);

    // 2. Simulate Respiratory Sinus Arrhythmia (RSA) inside the HR logic
    // Heart rate increases during inhalation, decreases during exhalation
    const breathCycle = Math.sin(this.noiseOffset * (this.currentVitals.RR / 60) * 2 * Math.PI);
    // We affect the internal HR slightly, but mostly this is visual noise in getSnapshot
  }

  // --- Helpers ---

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Math.min(t, 1);
  }

  private clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  private applyNoise(value: number, magnitude: number): number {
    // Simple Perlin-like noise approximation using sin waves
    const noise = Math.sin(this.noiseOffset * 2.5) * magnitude 
                + Math.cos(this.noiseOffset * 1.1) * (magnitude * 0.5);
    return value + noise;
  }

  private parseBP(bp: string): { sys: number, dia: number } {
    try {
      const [sys, dia] = bp.split('/').map(Number);
      return { sys: sys || 120, dia: dia || 80 };
    } catch {
      return { sys: 120, dia: 80 };
    }
  }

  private formatBP(sys: number, dia: number): string {
    return `${Math.round(sys)}/${Math.round(dia)}`;
  }
}

export const physiologyEngine = new PhysiologyEngine();
