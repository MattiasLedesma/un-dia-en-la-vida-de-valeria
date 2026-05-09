import Phaser from 'phaser';
import { musicManager } from '../systems/MusicManager';

export class LoadingScene extends Phaser.Scene {
  private type: 'tren' | 'subte' = 'tren';
  private nextScene = '';
  private targetX = 0;
  private targetY = 0;
  private timer = 0;
  private duration = 3000;

  constructor() {
    super({ key: 'LoadingScene' });
  }

  init(data: { nextScene: string; type: string; targetX: number; targetY: number }): void {
    this.nextScene = data.nextScene || 'OfficeScene';
    this.type = (data.type as 'tren' | 'subte') || 'tren';
    this.targetX = data.targetX || 4 * 32;
    this.targetY = data.targetY || 32;
    this.timer = 0;
  }

  create(): void {
    musicManager.start('loading');
    this.cameras.main.setBackgroundColor('#000000');

    if (this.type === 'tren') {
      this.drawTren();
    } else {
      this.drawSubte();
    }

    this.add.text(400, 520, 'Presioná ESPACIO para saltar', {
      fontFamily: 'monospace', fontSize: '11px', color: '#444466',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.finishLoading();
    });
  }

  private drawTren(): void {
    this.add.text(400, 80, '🚂 VIAJANDO EN TREN ROCA', {
      fontFamily: 'monospace', fontSize: '24px', color: '#ff8800',
    }).setOrigin(0.5);

    this.add.text(400, 120, 'Constitución - Temperley...', {
      fontFamily: 'monospace', fontSize: '14px', color: '#888888',
    }).setOrigin(0.5);

    for (let i = 0; i < 5; i++) {
      const g = this.add.graphics();
      g.fillStyle(0x333333, 1);
      g.fillRect(100 + i * 140, 200, 120, 180);
      g.fillStyle(0x555555, 1);
      g.fillRect(110 + i * 140, 210, 100, 40);
      g.fillRect(110 + i * 140, 260, 100, 40);
      g.fillRect(110 + i * 140, 310, 100, 40);
      g.fillStyle(0x88ccff, 0.3);
      g.fillRect(115 + i * 140, 215, 30, 30);
      g.fillRect(165 + i * 140, 215, 30, 30);
      g.fillRect(115 + i * 140, 265, 30, 30);
      g.fillRect(165 + i * 140, 265, 30, 30);
    }

    const text = this.add.text(400, 450, '🧟 "Braaaaains... perdón, ¿éste va a Constitución?"', {
      fontFamily: 'monospace', fontSize: '14px', color: '#66aa66',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text, alpha: 0.3, duration: 1500, yoyo: true, repeat: -1,
    });
  }

  private drawSubte(): void {
    this.add.text(400, 80, '🚇 SUBTE D', {
      fontFamily: 'monospace', fontSize: '24px', color: '#00aaff',
    }).setOrigin(0.5);

    this.add.text(400, 120, 'Catedral - Congreso - Facultad de Medicina...', {
      fontFamily: 'monospace', fontSize: '14px', color: '#888888',
    }).setOrigin(0.5);

    const tunnel = this.add.graphics();
    tunnel.fillStyle(0x1a1a3a, 1);
    tunnel.fillRect(0, 180, 800, 220);
    tunnel.fillStyle(0x333355, 1);
    tunnel.fillRect(0, 180, 800, 10);
    tunnel.fillRect(0, 390, 800, 10);

    this.add.text(300, 280, '⬛⬛⬛⬛⬛⬛⬛⬛', {
      fontFamily: 'monospace', fontSize: '20px', color: '#444466',
    });

    this.add.text(300, 330, '⬛⬛⬛⬛⬛⬛⬛⬛', {
      fontFamily: 'monospace', fontSize: '14px', color: '#333355',
    });

    const text = this.add.text(400, 460, '"Winter is coming... bajate del subte"', {
      fontFamily: 'monospace', fontSize: '14px', color: '#4488ff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text, alpha: 0.3, duration: 1500, yoyo: true, repeat: -1,
    });
  }

  update(_time: number, delta: number): void {
    this.timer += delta;
    if (this.timer >= this.duration) {
      this.finishLoading();
    }
  }

  private finishLoading(): void {
    musicManager.stop();
    this.scene.start(this.nextScene, {
      playerX: this.targetX, playerY: this.targetY,
    });
  }
}
