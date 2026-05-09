import Phaser from 'phaser';
import { musicManager } from '../systems/MusicManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    musicManager.start('boot');
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const cx = this.scale.width / 2;

    this.add.text(cx, 100, 'UN DÍA EN LA', {
      fontFamily: 'monospace', fontSize: '48px', color: '#ff6b9d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 160, 'VIDA DE VALERIA', {
      fontFamily: 'monospace', fontSize: '48px', color: '#ff6b9d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 230, '🐱  🐶  🧟  ❤️', {
      fontFamily: 'monospace', fontSize: '32px',
    }).setOrigin(0.5);

    this.add.text(cx, 290, 'Un juego de Matias para Valeria', {
      fontFamily: 'monospace', fontSize: '14px', color: '#8888aa',
    }).setOrigin(0.5);

    this.add.text(cx, 320, '❤️ 1 AÑO ❤️', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444',
    }).setOrigin(0.5);

    const pressStart = this.add.text(cx, 440, 'Presioná ESPACIO para empezar', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pressStart, alpha: 0.3, duration: 800, yoyo: true, repeat: -1,
    });

    this.add.text(cx, 500, 'Flechas/WASD: mover | ESPACIO: interactuar', {
      fontFamily: 'monospace', fontSize: '11px', color: '#666688',
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      musicManager.stop();
      this.scene.start('RoomScene');
    });
    this.input.keyboard?.once('keydown-ENTER', () => {
      musicManager.stop();
      this.scene.start('RoomScene');
    });
  }
}
