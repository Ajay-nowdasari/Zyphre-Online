class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;

  constructor() {
    // Lazy initialize on first user gesture
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('life_rpg_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('life_rpg_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Subtle futuristic click/hover blip
   */
  public playBlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Resonant crystal chime for quest completion
   */
  public playQuestComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, this.ctx!.currentTime + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.06);
      osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.4);
    });
  }

  /**
   * Heroic triumph chord progression upon leveling up
   */
  public playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { notes: [440, 554.37, 659.25], time: 0 }, // A Major
      { notes: [493.88, 622.25, 739.99], time: 0.15 }, // B Major
      { notes: [554.37, 698.46, 830.61], time: 0.3 }, // C# Major
      { notes: [659.25, 830.61, 987.77, 1318.5], time: 0.48 }, // E Major Triumphant
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + chord.time);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + chord.time);
        gain.gain.linearRampToValueAtTime(
          this.volume * 0.25,
          this.ctx!.currentTime + chord.time + 0.03
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx!.currentTime + chord.time + (chord.time > 0.4 ? 0.8 : 0.25)
        );

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + chord.time);
        osc.stop(this.ctx!.currentTime + chord.time + 0.9);
      });
    });
  }

  /**
   * Crisp golden coin clinking when earning or spending gold
   */
  public playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc1.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, this.ctx.currentTime); // B6

    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.35);
    osc2.stop(this.ctx.currentTime + 0.35);
  }

  /**
   * Theme warp shift chime
   */
  public playThemeSwitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

export const sound = new AudioEngine();
