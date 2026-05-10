import Phaser from 'phaser';
import { TILE, TILE_COLORS, COLLISION_TILES, createMapData, getMapUADE } from '../data/maps';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';
import { addPetToParty } from '../systems/BattleSystem';

export class UADEScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Graphics;
  private playerX = 4 * TILE;
  private playerY = 2 * TILE;
  private dialogue!: DialogueManager;
  private state!: GameState;
  private canMove = true;
  private isInDialogue = false;
  private tizianoTalked = false;
  private encountersDone = 0;
  private benjaTriggered = false;
  private allEncountersDone = false;

  constructor() {
    super({ key: 'UADEScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    if (!this.state) {
      this.state = { party: [], atunCount: 3, hasBackpack: true, defeatedBenja: false, collectedKey: false, currentPetIndex: 0, flags: {}, playerX: 0, playerY: 0, zone: 'uade', completedTutorial: true };
      this.registry.set('gameState', this.state);
    }
    this.state.zone = 'uade';

    musicManager.start('uade');
    this.cameras.main.setBackgroundColor('#000000');

    const map = createMapData(getMapUADE());
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        const g = this.add.graphics();
        g.fillStyle(TILE_COLORS[tile] || 0x000000, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
        if (tile === 3) {
          g.fillStyle(0x1a3d12, 1);
          g.fillCircle(x * TILE + 16, y * TILE + 20, 10);
        }
        if (tile === 5) {
          g.fillStyle(0x6b5b4b, 1);
          g.fillRect(x * TILE, y * TILE, TILE, TILE);
          g.fillStyle(0x8b7b6b, 1);
          g.fillRect(x * TILE + 2, y * TILE + 6, TILE - 4, TILE - 10);
        }
      }
    }

    this.add.text(4 * TILE, TILE, 'UADE - SEDE MONSERRAT', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888888',
    });

    // Eliminadas llamadas a drawPlayer y drawTiziano

    this.dialogue = new DialogueManager(this);

    this.time.delayedCall(300, () => {
      if (!this.state.defeatedBenja) {
        this.showTip('Encontrá a Benja para avanzar... si podés.');
      }
    });
  }

  // se borran drawPlayer, updatePlayerSprite, drawTiziano

  private showTip(msg: string): void {
    const t = this.add.text(400, 560, msg, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffcc00',
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0, delay: 3000, duration: 1000, onComplete: () => t.destroy() });
  }

  update(_time: number, delta: number): void {
    this.dialogue.update(delta);
    if (!this.canMove || this.isInDialogue) return;

    const cursors = this.input.keyboard!.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    let dx = 0, dy = 0;
    if (cursors.left.isDown || wasd.A.isDown) dx = -1;
    else if (cursors.right.isDown || wasd.D.isDown) dx = 1;
    if (cursors.up.isDown || wasd.W.isDown) dy = -1;
    else if (cursors.down.isDown || wasd.S.isDown) dy = 1;

    if (dx !== 0 && dy !== 0) {
      if (Math.random() < 0.5) dy = 0;
      else dx = 0;
    }

    if (dx !== 0 || dy !== 0) {
      const speed = 2;
      const nx = this.playerX + dx * speed;
      const ny = this.playerY + dy * speed;
      const tileX = Math.floor((nx + TILE / 2) / TILE);
      const tileY = Math.floor((ny + TILE / 2) / TILE);
      const map = getMapUADE();
      if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        if (!COLLISION_TILES.has(map[tileY][tileX])) {
          this.playerX = nx;
          this.playerY = ny;
          this.player.setPosition(this.playerX, this.playerY);
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(space)) {
      if (this.isInDialogue) {
        this.dialogue.advance();
      } else {
        this.checkInteractions();
      }
    }
  }

  private checkInteractions(): void {
    const thresh = TILE * 1.5;

    if (!this.tizianoTalked) {
      const dist = Math.abs(this.playerX - 12 * TILE) + Math.abs(this.playerY - 4 * TILE);
      if (dist < thresh) {
        this.tizianoTalked = true;
        this.isInDialogue = true;
        this.canMove = false;
        const line = getDialogue('tiziano_uade', 'start');
        if (line) {
          this.dialogue.show(line, (action) => {
            if (action && action.startsWith('tizi_')) {
              const l2 = getDialogue('tiziano_uade', action);
              if (l2) this.dialogue.show(l2, (act) => { this.isInDialogue = false; this.canMove = true; });
              else { this.isInDialogue = false; this.canMove = true; }
            } else {
              this.isInDialogue = false;
              this.canMove = true;
            }
          });
        }
        return;
      }
    }

    const enc1 = { x: 6, y: 10, dist: Math.abs(this.playerX - 6 * TILE) + Math.abs(this.playerY - 10 * TILE) };
    const enc2 = { x: 18, y: 12, dist: Math.abs(this.playerX - 18 * TILE) + Math.abs(this.playerY - 12 * TILE) };
    const enc3 = { x: 12, y: 15, dist: Math.abs(this.playerX - 12 * TILE) + Math.abs(this.playerY - 15 * TILE) };

    const encs = [enc1, enc2, enc3];
    for (const e of encs) {
      if (e.dist < TILE && !this.state.flags[`encounter_${e.x}_${e.y}`]) {
        this.state.flags[`encounter_${e.x}_${e.y}`] = true;
        this.encountersDone++;
        if (e.x === 6 || e.x === 18) {
          if (!this.state.flags['captured_bacco']) {
            this.state.flags['captured_bacco'] = true;
            addPetToParty(this.state, 'bacco');
            this.showTip('🐶 Bacco se unió a tu equipo!');
          }
          this.isInDialogue = true;
          this.canMove = false;
          const line = getDialogue('bacco_encounter', 'start');
          if (line) {
            this.dialogue.show(line, (action) => {
              musicManager.stop();
              this.scene.launch('BattleScene', {
                zombie: 'student_zombie', petJoin: null,
                returnScene: 'UADEScene', returnData: {},
              });
              this.scene.pause();
            });
          }
        } else if (e.x === 12) {
          this.triggerBenja();
        }
        return;
      }
    }

    if (!this.benjaTriggered && this.encountersDone >= 2) {
      this.triggerBenja();
      return;
    }

    if (this.state.defeatedBenja) {
      const exitX = 12 * TILE;
      const exitY = 17 * TILE;
      const dist = Math.abs(this.playerX - exitX) + Math.abs(this.playerY - exitY);
      if (dist < TILE) {
        musicManager.stop();
        this.scene.start('FinalScene', {});
      }
    }
  }

  private triggerBenja(): void {
    if (this.benjaTriggered) return;
    this.benjaTriggered = true;
    this.add.text(12 * TILE, 2 * TILE, '🖤', { fontSize: '20px' }).setOrigin(0.5);
    const txt = this.add.text(400, 80, 'BENJA apareció!', {
      fontFamily: 'monospace', fontSize: '18px', color: '#000000',
    }).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: 60, duration: 500 });
    this.time.delayedCall(800, () => {
      this.isInDialogue = true;
      this.canMove = false;
      txt.destroy();
      const line = getDialogue('benja_final_boss', 'start');
      if (line) {
        this.dialogue.show(line, (action) => {
          if (action === 'battle_benja') {
            musicManager.stop();
            this.scene.launch('BattleScene', {
              zombie: 'benja', petJoin: null,
              returnScene: 'UADEScene', returnData: {},
              isBoss: true,
            });
            this.scene.pause();
          } else if (action === 'benja_rage' || action === 'benja_3') {
            const l2 = getDialogue('benja_final_boss', action);
            if (l2) this.dialogue.show(l2, (act) => {
              if (act === 'battle_benja') {
                musicManager.stop();
                this.scene.launch('BattleScene', {
                  zombie: 'benja', petJoin: null,
                  returnScene: 'UADEScene', returnData: {},
                  isBoss: true,
                });
                this.scene.pause();
              }
            });
          } else {
            this.isInDialogue = false;
            this.canMove = true;
          }
        });
      }
    });
  }
}
