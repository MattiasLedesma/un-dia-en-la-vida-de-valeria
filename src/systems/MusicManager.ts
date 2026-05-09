export class MusicManager {
  private ctx: AudioContext | null = null;
  private currentOsc: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private isPlaying = false;

  private melodies: Record<string, number[]> = {
    boot: [262, 330, 392, 523, 392, 330, 262],
    room: [294, 370, 440, 587, 440, 370, 294],
    overworld: [330, 392, 440, 330, 392, 440, 523],
    office: [262, 311, 392, 311, 262, 349, 440, 349],
    uade: [293, 349, 440, 349, 293, 392, 523, 392],
    battle: [196, 233, 277, 233, 196, 262, 277, 262],
    final: [262, 330, 392, 523, 659, 784, 659, 523, 392, 330, 262],
    loading: [200, 250, 300, 250, 200],
  };

  start(scene: string): void {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
      }
      if (this.isPlaying) this.stop();

      const notes = this.melodies[scene] || this.melodies.overworld;
      this.isPlaying = true;

      const playNote = (index: number) => {
        if (!this.isPlaying || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.value = notes[index % notes.length];
        gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.4);

        setTimeout(() => playNote((index + 1) % notes.length), 500);
      };

      playNote(0);
    } catch { }
  }

  stop(): void {
    this.isPlaying = false;
  }

  playTune(notes: number[], bpm = 120): void {
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      const noteLen = 60 / bpm;

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + i * noteLen);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * noteLen + noteLen * 0.9);
        osc.start(this.ctx.currentTime + i * noteLen);
        osc.stop(this.ctx.currentTime + i * noteLen + noteLen * 0.9);
      });
    } catch { }
  }

  sfx(type: string): void {
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.2);
      } else if (type === 'capture') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.4);
      } else if (type === 'key') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, this.ctx.currentTime);
        osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(784, this.ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1047, this.ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 1);
      }
    } catch { }
  }
}

export const musicManager = new MusicManager();
