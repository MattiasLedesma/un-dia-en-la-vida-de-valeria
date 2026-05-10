import Phaser from 'phaser';
import { musicManager } from '../systems/MusicManager';

export class LoadingScene extends Phaser.Scene {
  private type: 'tren' | 'subte' = 'tren';
  private nextScene = '';
  private targetX = 0;
  private targetY = 0;
  private timer = 0;
  private duration = 3000;
  private zone = '';

  constructor() {
    super({ key: 'LoadingScene' });
  }

  init(data: { nextScene?: string; type?: string; targetX?: number; targetY?: number; zone?: string }): void {
    this.nextScene = data.nextScene || 'OfficeScene';
    this.type = (data.type as 'tren' | 'subte') || 'tren';
    this.targetX = data.targetX ?? 4 * 32;
    this.targetY = data.targetY ?? 32;
    this.zone = data.zone || '';
    this.timer = 0;
  }

  create(): void {
    musicManager.start('loading');
    this.cameras.main.setBackgroundColor('#000000');

    if (this.type === 'tren') this.drawTren();
    else this.drawSubte();

    this.add.text(400, 520, 'Presioná ESPACIO para saltar', {
      fontFamily: 'monospace', fontSize: '11px', color: '#444466',
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => this.finishLoading());
  }

  private drawTren(): void {
    this.add.image(400, 300, 'bg_tren').setDepth(-10);
    const t = this.add.text(400, 450, '🧟 "Braaaaains... perdón, ¿éste va a Constitución?"', {
      fontFamily: 'monospace', fontSize: '14px', color: '#66aa66',
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0.3, duration: 1500, yoyo: true, repeat: -1 });
  }

  private drawSubte(): void {
    this.add.image(400, 300, 'bg_subte').setDepth(-10);
    const t = this.add.text(400, 460, '"Winter is coming... bajate del subte"', {
      fontFamily: 'monospace', fontSize: '14px', color: '#4488ff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0.3, duration: 1500, yoyo: true, repeat: -1 });
  }

  update(_time: number, delta: number): void {
    this.timer += delta;
    if (this.timer >= this.duration) this.finishLoading();
  }

  private finishLoading(): void {
    musicManager.stop();
    const data: Record<string, any> = { playerX: this.targetX, playerY: this.targetY };
    if (this.zone) data.zone = this.zone;
    this.scene.start(this.nextScene, data);
  }
}
