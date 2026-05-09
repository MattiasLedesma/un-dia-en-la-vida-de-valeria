import Phaser from 'phaser';
import { MAP_ROOM, TILE, TILE_COLORS, COLLISION_TILES, createMapData } from '../data/maps';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';
import { createInitialState, addPetToParty } from '../systems/BattleSystem';

const stateKey = 'gameState';

export class RoomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Graphics;
  private playerX = 5 * TILE;
  private playerY = 7 * TILE;
  private dialogue!: DialogueManager;
  private state!: GameState;
  private canMove = false;
  private isInDialogue = false;
  private pets: { id: string; gfx: Phaser.GameObjects.Graphics; tx: number; ty: number }[] = [];
  private backpackGfx!: Phaser.GameObjects.Graphics;
  private backpackCollected = false;

  constructor() {
    super({ key: 'RoomScene' });
  }

  create(): void {
    this.state = createInitialState();
    this.registry.set(stateKey, this.state);
    musicManager.start('room');
    this.cameras.main.setBackgroundColor('#000000');

    const map = createMapData(MAP_ROOM);

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        const g = this.add.graphics();
        g.fillStyle(TILE_COLORS[tile] || 0x000000, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
        if (tile === 13) {
          g.fillStyle(0x4682b4, 1);
          g.fillRect(x * TILE + 2, y * TILE + 8, TILE - 4, TILE - 8);
          g.fillStyle(0x87ceeb, 1);
          g.fillRect(x * TILE + 4, y * TILE + 12, TILE - 8, TILE - 12);
        }
        if (tile === 14) {
          g.fillStyle(0x333333, 1);
          g.fillRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8);
          g.fillStyle(0x00ff00, 0.3);
          g.fillRect(x * TILE + 6, y * TILE + 6, TILE - 12, TILE - 12);
        }
      }
    }

    this.drawPlayer();

    const petPositions = [
      { id: 'rufino', tx: 8, ty: 3, color: 0x888888, color2: 0x333333 },
      { id: 'berlioz', tx: 2, ty: 8, color: 0xeeeeee, color2: 0x111111 },
      { id: 'bacco', tx: 9, ty: 8, color: 0x8b4513, color2: 0x000000 },
    ];

    petPositions.forEach(p => {
      const g = this.add.graphics();
      this.drawPet(g, p.color, p.color2);
      g.setPosition(p.tx * TILE, p.ty * TILE);
      this.pets.push({ id: p.id, gfx: g, tx: p.tx, ty: p.ty });
    });

    this.backpackGfx = this.add.graphics();
    this.drawBackpack(this.backpackGfx);
    this.backpackGfx.setPosition(4 * TILE, 9 * TILE);

    this.dialogue = new DialogueManager(this);

    this.startIntroDialogue();
  }

  private startIntroDialogue(): void {
    this.canMove = false;
    this.isInDialogue = true;
    const line = getDialogue('intro', 'start');
    if (line) {
      this.dialogue.show(line, (action) => this.handleDialogueAction(action));
    }
  }

  private handleDialogueAction(action?: string): void {
    if (!action) return;
    if (action === 'start_game') {
      this.isInDialogue = false;
      this.canMove = true;
      this.state.hasBackpack = true;
      this.backpackCollected = true;
      this.backpackGfx.clear();
      addPetToParty(this.state, 'rufino');
      addPetToParty(this.state, 'berlioz');
      addPetToParty(this.state, 'bacco');
    } else if (action === 'close') {
      this.isInDialogue = false;
      this.canMove = true;
    } else {
      const line = getDialogue('intro', action);
      if (line) {
        this.dialogue.show(line, (a) => this.handleDialogueAction(a));
      } else {
        this.isInDialogue = false;
        this.canMove = true;
      }
    }
  }

  private drawPlayer(): void {
    this.player = this.add.graphics();
    this.updatePlayerPosition();
  }

  private updatePlayerPosition(): void {
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
    p.fillStyle(0xffccaa, 1);
    p.fillCircle(-8, 0, 2);
    p.fillCircle(8, 0, 2);
    p.setPosition(this.playerX, this.playerY);
  }

  private drawPet(g: Phaser.GameObjects.Graphics, color: number, color2: number): void {
    g.fillStyle(color, 1);
    g.fillCircle(0, -6, 6);
    g.fillTriangle(-8, -2, 8, -2, 0, 8);
    g.fillStyle(color2, 1);
    g.fillTriangle(-4, -10, 0, -14, 0, -6);
    g.fillTriangle(4, -10, 0, -14, 0, -6);
  }

  private drawBackpack(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0xff4444, 1);
    g.fillRoundedRect(-8, -6, 16, 14, 3);
    g.fillStyle(0xcc2222, 1);
    g.fillRoundedRect(-6, -4, 12, 10, 2);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeRoundedRect(-8, -6, 16, 14, 3);
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(0, 1, 2);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(-3, -6, 3, -6, 0, -2);
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
      const map = MAP_ROOM;
      if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        if (!COLLISION_TILES.has(map[tileY][tileX])) {
          this.playerX = nx;
          this.playerY = ny;
          this.updatePlayerPosition();
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(space)) {
      this.checkInteraction();
    }

    if (Phaser.Input.Keyboard.JustDown(space) && this.isInDialogue) {
      this.dialogue.advance();
    }
  }

  private checkInteraction(): void {
    const threshold = TILE * 1.5;

    for (const pet of this.pets) {
      const px = pet.tx * TILE;
      const py = pet.ty * TILE;
      const dist = Math.abs(this.playerX - px) + Math.abs(this.playerY - py);
      if (dist < threshold) {
        this.isInDialogue = true;
        this.canMove = false;
        const petKey = pet.id === 'rufino' ? 'rufino_intro' : pet.id === 'berlioz' ? 'berlioz_intro' : 'bacco_intro';
        const line = getDialogue('intro', petKey);
        if (line) {
          this.dialogue.show(line, (action) => this.handleDialogueAction(action));
        }
        return;
      }
    }

    if (!this.backpackCollected) {
      const bx = 4 * TILE;
      const by = 9 * TILE;
      const dist = Math.abs(this.playerX - bx) + Math.abs(this.playerY - by);
      if (dist < threshold) {
        this.isInDialogue = true;
        this.canMove = false;
        const line = getDialogue('intro', 'ready');
        if (line) {
          this.dialogue.show(line, (action) => this.handleDialogueAction(action));
        }
        return;
      }
    }

    const doorX = 5 * TILE;
    const doorY = 10 * TILE;
    const dist = Math.abs(this.playerX - doorX) + Math.abs(this.playerY - doorY);
    if (dist < TILE) {
      musicManager.stop();
      this.scene.start('OverworldScene', { zone: 'guernica', playerX: 4 * TILE, playerY: TILE });
    }
  }

  shutdown(): void {
    this.dialogue.destroy();
  }
}
