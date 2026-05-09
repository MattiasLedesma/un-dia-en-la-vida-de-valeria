import Phaser from 'phaser';
import { TILE, TILE_COLORS, COLLISION_TILES, createMapData, getMapAllaria } from '../data/maps';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Graphics;
  private playerX = 3 * TILE;
  private playerY = 12 * TILE;
  private dialogue!: DialogueManager;
  private state!: GameState;
  private canMove = true;
  private isInDialogue = false;
  private npcSprites: { id: string; gfx: Phaser.GameObjects.Graphics; tx: number; ty: number; dialogueScene: string; dialogueKey: string }[] = [];
  private encounterZones: { x: number; y: number; zombie: string; done: boolean }[] = [
    { x: 10, y: 4, zombie: 'office_zombie', done: false },
    { x: 18, y: 10, zombie: 'office_zombie', done: false },
  ];
  private atunPickups: { x: number; y: number; collected: boolean }[] = [
    { x: 6, y: 4, collected: false },
  ];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private space!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    if (!this.state) {
      this.state = { party: [], atunCount: 3, hasBackpack: true, defeatedBenja: false, collectedKey: false, currentPetIndex: 0, flags: {}, playerX: 0, playerY: 0, zone: 'allaria', completedTutorial: true };
      this.registry.set('gameState', this.state);
    }
    this.state.zone = 'allaria';

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    musicManager.start('office');
    this.cameras.main.setBackgroundColor('#000000');

    const map = createMapData(getMapAllaria());
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        const g = this.add.graphics();
        g.fillStyle(TILE_COLORS[tile] || 0x000000, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
        if (tile === 11) {
          g.fillStyle(0x5c3a1e, 1);
          g.fillRect(x * TILE + 2, y * TILE + 6, TILE - 4, TILE - 6);
          g.fillStyle(0x8b6914, 1);
          g.fillRect(x * TILE + 4, y * TILE + 8, TILE - 8, TILE - 10);
        }
      }
    }

    this.add.text(4 * TILE, TILE, 'ALLARIA', {
      fontFamily: 'monospace', fontSize: '12px', color: '#888888',
    });

    this.drawPlayer();

    this.npcSprites = [
      { id: 'camila', tx: 14, ty: 8, dialogueScene: 'camila_office', dialogueKey: 'start', gfx: this.add.graphics() },
      { id: 'rama_sol', tx: 6, ty: 12, dialogueScene: 'rama_sol_office', dialogueKey: 'start', gfx: this.add.graphics() },
    ];

    this.npcSprites.forEach(n => {
      this.drawNPC(n.gfx, n.id);
      n.gfx.setPosition(n.tx * TILE, n.ty * TILE);
    });

    this.atunPickups.forEach(a => {
      if (!a.collected) {
        const g = this.add.graphics();
        g.fillStyle(0xffcc00, 1);
        g.fillRoundedRect(-5, -4, 10, 8, 2);
        g.fillStyle(0xffffff, 1);
        g.fillRect(-3, -3, 6, 1);
        g.fillRect(-3, 0, 6, 1);
        g.setPosition(a.x * TILE, a.y * TILE);
        g.setDepth(5);
      }
    });

    this.dialogue = new DialogueManager(this);
  }

  private drawPlayer(): void {
    this.player = this.add.graphics();
    this.updatePlayerSprite();
  }

  private updatePlayerSprite(): void {
    this.player.clear();
    const p = this.player;
    p.fillStyle(0xffccaa, 1);
    p.fillCircle(0, -8, 7);
    p.fillStyle(0xff69b4, 1);
    p.fillRoundedRect(-7, -1, 14, 12, 2);
    p.fillStyle(0xcc5599, 1);
    p.fillRoundedRect(-7, 11, 6, 8, 1);
    p.fillRoundedRect(1, 11, 6, 8, 1);
    p.fillStyle(0x000000, 1);
    p.fillCircle(-3, -9, 1.5);
    p.fillCircle(3, -9, 1.5);
    p.setPosition(this.playerX, this.playerY);
  }

  private drawNPC(g: Phaser.GameObjects.Graphics, id: string): void {
    g.fillStyle(0xffccaa, 1);
    g.fillCircle(0, -8, 7);
    if (id === 'camila') {
      g.fillStyle(0x44aa44, 1);
      g.fillRoundedRect(-7, -1, 14, 20, 2);
      g.fillStyle(0xcc6600, 1);
      g.fillRect(-4, -2, 8, 6);
    } else if (id === 'rama_sol') {
      g.fillStyle(0x4488cc, 1);
      g.fillRoundedRect(-9, -1, 8, 20, 2);
      g.fillStyle(0xcc4488, 1);
      g.fillRoundedRect(1, -1, 8, 20, 2);
    }
    g.fillStyle(0x000000, 1);
    g.fillCircle(-3, -9, 1.5);
    g.fillCircle(3, -9, 1.5);
  }

  update(_time: number, delta: number): void {
    this.dialogue.update(delta);

    if (this.isInDialogue) {
      if (Phaser.Input.Keyboard.JustDown(this.space)) {
        this.dialogue.advance();
      }
      return;
    }

    if (!this.canMove) return;

    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx !== 0 && dy !== 0) { if (Math.random() < 0.5) dy = 0; else dx = 0; }

    if (dx !== 0 || dy !== 0) {
      const speed = 2;
      const nx = this.playerX + dx * speed;
      const ny = this.playerY + dy * speed;
      const tileX = Math.floor((nx + TILE / 2) / TILE);
      const tileY = Math.floor((ny + TILE / 2) / TILE);
      const map = getMapAllaria();
      if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        if (!COLLISION_TILES.has(map[tileY][tileX])) {
          this.playerX = nx; this.playerY = ny;
          this.updatePlayerSprite();
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      this.checkInteractions();
    }
  }

  private checkInteractions(): void {
    const thresh = TILE * 1.5;

    for (const n of this.npcSprites) {
      const dist = Math.abs(this.playerX - n.tx * TILE) + Math.abs(this.playerY - n.ty * TILE);
      if (dist < thresh) {
        this.isInDialogue = true;
        this.canMove = false;
        const line = getDialogue(n.dialogueScene, n.dialogueKey);
        if (line) {
          this.dialogue.show(line, (action) => {
            if (action && action.startsWith('cami_') || action === 'rama_sol_zombie' || action === 'rama_sol_final') {
              const l2 = getDialogue(n.dialogueScene, action);
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

    for (const a of this.atunPickups) {
      if (a.collected) continue;
      const dist = Math.abs(this.playerX - a.x * TILE) + Math.abs(this.playerY - a.y * TILE);
      if (dist < TILE) {
        a.collected = true;
        this.state.atunCount = (this.state.atunCount || 0) + 2;
        const txt = this.add.text(this.playerX, this.playerY - 30, '+2 ATÚN 🐟', {
          fontFamily: 'monospace', fontSize: '14px', color: '#ffcc00',
        }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
        return;
      }
    }

    for (const ez of this.encounterZones) {
      if (ez.done) continue;
      const dist = Math.abs(this.playerX - ez.x * TILE) + Math.abs(this.playerY - ez.y * TILE);
      if (dist < TILE) {
        ez.done = true;
        this.isInDialogue = true;
        this.canMove = false;
        musicManager.stop();
        this.scene.launch('BattleScene', {
          zombie: ez.zombie, petJoin: ez.zombie === 'office_zombie' ? 'berlioz' : null,
          returnScene: 'OfficeScene', returnData: {},
        });
        this.scene.pause();
        return;
      }
    }

    const dist = Math.abs(this.playerX - 12 * TILE) + Math.abs(this.playerY - 13 * TILE);
    if (dist < TILE) {
      musicManager.stop();
      this.scene.start('LoadingScene', {
        nextScene: 'OverworldScene', type: 'subte',
        targetX: 4 * TILE, targetY: 2 * TILE,
      });
    }
  }
}
