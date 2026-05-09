import Phaser from 'phaser';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';

export class FinalScene extends Phaser.Scene {
  private dialogue!: DialogueManager;
  private isInDialogue = false;
  private state!: GameState;
  private keyGfx!: Phaser.GameObjects.Graphics;
  private keyCollected = false;
  private creditsLines: string[] = [];

  constructor() {
    super({ key: 'FinalScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    if (!this.state) {
      this.state = { party: [], atunCount: 0, hasBackpack: true, defeatedBenja: true, collectedKey: false, currentPetIndex: 0, flags: {}, playerX: 0, playerY: 0, zone: 'uade', completedTutorial: true };
      this.registry.set('gameState', this.state);
    }

    musicManager.start('final');
    this.cameras.main.setBackgroundColor('#1a0a2e');

    this.add.text(400, 30, '🏠 CASA DE MATI', {
      fontFamily: 'monospace', fontSize: '16px', color: '#8888aa',
    }).setOrigin(0.5);

    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 25; x++) {
        const g = this.add.graphics();
        if (y === 0 || y === 14 || x === 0 || x === 24) {
          g.fillStyle(0x5c4033, 1);
        } else if (y > 10 && (x > 8 && x < 16)) {
          g.fillStyle(0xc4a882, 1);
        } else {
          g.fillStyle(0xc4a882, 1);
        }
        g.fillRect(x * 32, y * 32, 32, 32);
      }
    }

    this.add.text(400, 200, 'MATIAS', {
      fontFamily: 'monospace', fontSize: '11px', color: '#888888',
    }).setOrigin(0.5);

    const matiGfx = this.add.graphics();
    matiGfx.fillStyle(0xffccaa, 1);
    matiGfx.fillCircle(400, 150, 12);
    matiGfx.fillStyle(0x3366cc, 1);
    matiGfx.fillRoundedRect(380, 162, 40, 30, 4);
    matiGfx.fillStyle(0x224488, 1);
    matiGfx.fillRect(384, 192, 16, 6);
    matiGfx.fillRect(400, 192, 16, 6);
    matiGfx.fillStyle(0x000000, 1);
    matiGfx.fillCircle(394, 148, 2);
    matiGfx.fillCircle(406, 148, 2);
    matiGfx.fillStyle(0x333333, 1);
    matiGfx.fillRect(415, 155, 12, 8);

    const deskGfx = this.add.graphics();
    deskGfx.fillStyle(0x6b4423, 1);
    deskGfx.fillRect(370, 200, 60, 8);
    deskGfx.fillStyle(0x553311, 1);
    deskGfx.fillRect(370, 208, 5, 30);
    deskGfx.fillRect(425, 208, 5, 30);

    this.keyGfx = this.add.graphics();
    this.drawKey(this.keyGfx);
    this.keyGfx.setPosition(400, 300);
    this.keyGfx.setAlpha(0);

    this.tweens.add({
      targets: this.keyGfx,
      alpha: 1,
      delay: 500,
      duration: 1000,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: this.keyGfx,
      y: 280,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.dialogue = new DialogueManager(this);

    this.time.delayedCall(800, () => this.startFinalDialogue());
  }

  private drawKey(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0xffd700, 1);
    g.fillCircle(0, 0, 14);
    g.fillStyle(0xdaa520, 1);
    g.fillCircle(0, 0, 10);
    g.fillStyle(0xffd700, 1);
    g.fillRect(-3, 12, 6, 30);
    g.fillRect(-8, 30, 4, 8);
    g.fillRect(4, 30, 4, 8);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(0, 0, 4);
  }

  private startFinalDialogue(): void {
    this.isInDialogue = true;
    const line = getDialogue('final_key', 'start');
    if (line) {
      this.dialogue.show(line, (action) => this.handleFinalAction(action));
    }
  }

  private handleFinalAction(action?: string): void {
    if (!action) {
      this.isInDialogue = false;
      return;
    }

    if (action === 'claim_key') {
      this.collectKey();
      return;
    }

    const line = getDialogue('final_key', action);
    if (line) {
      this.dialogue.show(line, (act) => this.handleFinalAction(act));
    } else {
      this.isInDialogue = false;
    }
  }

  private collectKey(): void {
    this.keyCollected = true;
    this.state.collectedKey = true;
    musicManager.sfx('key');

    this.tweens.add({
      targets: this.keyGfx,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.cameras.main.fadeOut(1500, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.cameras.main.fadeIn(500);
          this.showCredits();
        });
      },
    });
  }

  private showCredits(): void {
    this.dialogue.hide();
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(400, 80, '🗝️ LLAVE RECOGIDA 🗝️', {
      fontFamily: 'monospace', fontSize: '24px', color: '#ffd700',
    }).setOrigin(0.5);

    this.add.text(400, 120, '"AHORA ANDÁ A BUSCAR LA LLAVE DE VERDAD"', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    this.creditsLines = [
      '',
      '',
      '🎮 UN DÍA EN LA VIDA DE VALERIA',
      '',
      '💻 Hecho con amor por Matias',
      '🐱 Para Valeria',
      '',
      '❤️  1 AÑO  ❤️',
      '',
      '',
      '🐱 RUFINO - El gato gris con rayas negras',
      '🐱 BERLIOZ - El gato blanco y negro elegante',
      '🐶 BACCO - El pastor alemán energético',
      '',
      '🧟 ZOMBIES: los de la calle, la ofi, la facu',
      '🖤 BENJA: el jefe final (estaba crudo)',
      '',
      '🏢 ALLARIA - La oficina de todos',
      '🏛️ UADE - La facultad del bigote de Tiziano',
      '🚂 Tren Roca y 🚇 Subte D',
      '',
      '🎵 Música chiptune original',
      '',
      '',
      'GRACIAS POR JUGAR',
      '',
      '"Te amo Valeria. Un año y los que vienen."',
      '- Matias (el gordo compu) 💻',
      '',
      '🐱🐶🗝️❤️',
    ];

    const creditsText = this.add.text(400, 200, this.creditsLines.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#dddddd',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0);

    this.tweens.add({
      targets: creditsText,
      y: -creditsText.height,
      duration: 30000,
      ease: 'Linear',
      onComplete: () => {
        this.add.text(400, 300, 'Presioná ESPACIO para volver al inicio', {
          fontFamily: 'monospace', fontSize: '14px', color: '#ffcc00',
        }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
          musicManager.stop();
          this.scene.start('BootScene');
        });
      },
    });
  }

  update(_time: number, delta: number): void {
    this.dialogue.update(delta);

    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (this.isInDialogue && Phaser.Input.Keyboard.JustDown(space)) {
      this.dialogue.advance();
    }
  }
}
