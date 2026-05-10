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

    this.add.image(400, 300, 'bg_casa_mati').setDepth(-10);

    const matiSpr = this.add.sprite(400, 160, 'matias');
    matiSpr.setOrigin(0.5, 1);

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
