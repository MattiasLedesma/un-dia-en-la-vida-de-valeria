import Phaser from 'phaser';
import { musicManager } from '../systems/MusicManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load sprites
    this.load.image('valeria', 'sprites/valeria.png');
    this.load.image('benja', 'sprites/benja.png');
    this.load.image('camila', 'sprites/camila.png');
    this.load.image('rama_sol', 'sprites/rama_sol.png');
    this.load.image('tiziano', 'sprites/tiziano.png');
    this.load.image('matias', 'sprites/matias.png');
    this.load.image('zombie', 'sprites/zombie.png');
    this.load.image('rufino', 'sprites/rufino.png');
    this.load.image('berlioz', 'sprites/berlioz.png');
    this.load.image('bacco', 'sprites/bacco.png');

    // Load backgrounds
    this.load.image('bg_room', 'bgs/room.png');
    this.load.image('bg_guernica', 'bgs/guernica.png');
    this.load.image('bg_allaria', 'bgs/allaria.png');
    this.load.image('bg_uade', 'bgs/uade.png');
    this.load.image('bg_tren', 'bgs/tren.png');
    this.load.image('bg_subte', 'bgs/subte.png');
    this.load.image('bg_casa_mati', 'bgs/casa_mati.png');
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
