
import { VitalsData } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;
  
  // Tinnitus Effect Nodes
  private tinnitusOsc: OscillatorNode | null = null;
  private tinnitusGain: GainNode | null = null;

  // Stethoscope Noise Nodes (Tactile Interaction)
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private heartSoundGain: GainNode | null = null; // Controls volume of the "clean" heartbeat

  private isMuted: boolean = true;
  private currentHR: number = 75;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  
  // Scheduling constants
  private lookahead = 25.0; // How frequently to call scheduling (ms)
  private scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  /**
   * Initialize the Audio Context (must be called after user interaction)
   */
  public init() {
    if (this.ctx) return;

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // 1. Master Chain Setup
    // Source -> LowPass Filter (Tunneling Effect) -> Master Gain -> Output
    this.masterGain = this.ctx!.createGain();
    this.masterGain.gain.value = 0.5;

    this.lowPassFilter = this.ctx!.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';
    this.lowPassFilter.frequency.value = 22000; // Start open (clear sound)
    this.lowPassFilter.Q.value = 1; // Slight resonance

    this.lowPassFilter.connect(this.masterGain);
    this.masterGain.connect(this.ctx!.destination);

    // 2. Tinnitus Generator (Simulates "Auditory Tunneling" / Ear Ringing)
    this.tinnitusOsc = this.ctx!.createOscillator();
    this.tinnitusOsc.type = 'sine';
    this.tinnitusOsc.frequency.value = 6000; // 6kHz ring
    
    this.tinnitusGain = this.ctx!.createGain();
    this.tinnitusGain.gain.value = 0; // Start silent

    this.tinnitusOsc.connect(this.tinnitusGain);
    this.tinnitusGain.connect(this.ctx!.destination);
    this.tinnitusOsc.start();

    // 3. Stethoscope Mixing Bus
    // We separate the procedural heartbeat into a specific gain node so we can mix it with noise
    this.heartSoundGain = this.ctx!.createGain();
    this.heartSoundGain.gain.value = 1.0; 
    this.heartSoundGain.connect(this.lowPassFilter); // Connect to main processing chain

    // 4. White Noise Generator (For Stethoscope Friction/Miss)
    this.createNoiseGenerator();

    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.startScheduler();
  }

  private createNoiseGenerator() {
    if (!this.ctx) return;
    
    // Create 2 seconds of white noise buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;
    
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0; // Start silent (perfect placement or no tool)

    this.noiseNode.connect(this.noiseGain);
    // Noise bypasses the lowpass filter usually, or goes through it. 
    // Let's bypass to sound like surface friction.
    this.noiseGain.connect(this.masterGain!); 
    this.noiseNode.start();
  }

  /**
   * TACTILE INTERACTION: 
   * Adjusts the mix between clear Heartbeat and Static Noise based on stethoscope position.
   * @param quality 0.0 (Pure Noise/Off target) to 1.0 (Crystal Clear/On target)
   */
  public setStethoscopeQuality(quality: number) {
      if (!this.heartSoundGain || !this.noiseGain || !this.ctx) return;
      
      const now = this.ctx.currentTime;
      
      // Heart sound volume: 0 to 1 based on quality
      // We use a slight curve so it drops off naturally
      const signalVol = Math.pow(quality, 2); 
      
      // Noise volume: Inverse of quality, but scaled down so it's not ear-shattering
      // If quality is 1 (perfect), noise is 0. If quality is 0, noise is 0.1
      const noiseVol = (1.0 - quality) * 0.15; 

      this.heartSoundGain.gain.setTargetAtTime(signalVol, now, 0.1);
      this.noiseGain.gain.setTargetAtTime(noiseVol, now, 0.1);
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.ctx && this.ctx.state === 'suspended' && !mute) {
      this.ctx.resume();
    }
  }

  public updateVitals(vitals: VitalsData) {
    this.currentHR = Math.max(vitals.HR, 1); // Prevent div by zero
    this.updatePsychoacoustics(vitals);
  }

  /**
   * PSYCHOACOUSTICS: Auditory Tunneling
   * If HR > 120 (Stress/Shock), muffle external sounds and increase tinnitus.
   */
  private updatePsychoacoustics(vitals: VitalsData) {
    if (!this.ctx || !this.lowPassFilter || !this.tinnitusGain) return;

    const stressThreshold = 120;
    const maxStressHR = 180;
    const now = this.ctx.currentTime;

    if (vitals.HR > stressThreshold) {
      // Calculate stress factor (0.0 to 1.0)
      const stressFactor = Math.min(1, (vitals.HR - stressThreshold) / (maxStressHR - stressThreshold));

      // 1. LowPass Filter: Close down frequency to simulate "muffled" hearing
      // Normal: 22000Hz -> Stressed: 400Hz
      const targetFreq = 22000 - (stressFactor * 21600);
      this.lowPassFilter.frequency.setTargetAtTime(targetFreq, now, 0.5);

      // 2. Tinnitus: Increase gain of high pitch ring
      // Silent -> 0.05 gain (which is audible for sine waves)
      const targetTinGain = stressFactor * 0.05;
      this.tinnitusGain.gain.setTargetAtTime(targetTinGain, now, 0.5);
    } else {
      // Restore normal hearing
      this.lowPassFilter.frequency.setTargetAtTime(22000, now, 0.5);
      this.tinnitusGain.gain.setTargetAtTime(0, now, 0.5);
    }
  }

  /**
   * Scheduler Loop: Checks if we need to schedule the next heartbeat
   */
  private startScheduler() {
    this.timerID = window.setInterval(() => {
      if (!this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
        this.scheduleHeartbeat(this.nextNoteTime);
        this.nextNote();
      }
    }, this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.currentHR;
    this.nextNoteTime += secondsPerBeat;
  }

  /**
   * Procedural Sound Synthesis: "Lub-Dub"
   */
  private scheduleHeartbeat(time: number) {
    if (this.isMuted || !this.ctx || !this.heartSoundGain) return;

    // "Lub" (S1) - Lower, longer
    this.playThump(time, 150, 0.08, 0.5);

    // "Dub" (S2) - Higher, shorter, slightly quieter, delayed by ~0.1s
    // Delay varies slightly with HR typically, but 0.12s is a good constant approximation for simulation
    const s2Delay = 0.12; 
    // At very high HR, S1 and S2 merge.
    if (60 / this.currentHR > 0.25) {
        this.playThump(time + s2Delay, 200, 0.06, 0.4);
    }
  }

  private playThump(time: number, freq: number, duration: number, vol: number) {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    // Use Triangle wave for a "fleshy" thud sound, better than Sine
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    // Pitch drop envelope (simulates tension release)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + duration);

    // Amplitude Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // Decay

    osc.connect(gain);
    // connect to heartSoundGain instead of filter directly, to allow mixing
    gain.connect(this.heartSoundGain!); 

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const audioEngine = new AudioEngine();
