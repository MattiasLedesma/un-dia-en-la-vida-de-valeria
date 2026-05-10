import Phaser from 'phaser';
import { MAP_ROOM, TILE, TILE_COLORS, COLLISION_TILES, createMapData } from '../data/maps';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';
import { createInitialState, addPetToParty } from '../systems/BattleSystem';

const stateKey = 'gameState';

export class RoomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerX = 5 * TILE;
  private playerY = 7 * TILE;
  private dialogue!: DialogueManager;
  private state!: GameState;
  private canMove = false;
  private isInDialogue = false;
  private pets: { id: string; sprite: Phaser.GameObjects.Sprite; tx: number; ty: number }[] = [];
  private backpackGfx!: Phaser.GameObjects.Graphics;
  private backpackCollected = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private space!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'RoomScene' });
  }

  create(): void {
    this.state = createInitialState();
    this.registry.set(stateKey, this.state);
    musicManager.start('room');
    this.cameras.main.setBackgroundColor('#000000');

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Fondo
    this.add.image(400, 300, 'bg_room').setDepth(-10);

    const map = createMapData(MAP_ROOM);
    // Solo dibujamos colisiones invisibles (comentamos el dibujo de tiles, pero las usamos para moverse)
    /* for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
      }
    } */

    this.player = this.add.sprite(this.playerX, this.playerY, 'valeria');
    this.player.setOrigin(0.5, 1);

    const petPositions = [
      { id: 'rufino', tx: 8, ty: 3 },
      { id: 'berlioz', tx: 2, ty: 8 },
      { id: 'bacco', tx: 9, ty: 8 },
    ];

    petPositions.forEach(p => {
      const spr = this.add.sprite(p.tx * TILE, p.ty * TILE, p.id);
      spr.setOrigin(0.5, 1);
      this.pets.push({ id: p.id, sprite: spr, tx: p.tx, ty: p.ty });
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
    if (!action) { this.isInDialogue = false; this.canMove = true; return; }
    if (action === 'start_game') {
      this.isInDialogue = false;
      this.canMove = true;
      this.state.hasBackpack = true;
      this.backpackCollected = true;
      this.backpackGfx.clear();
      addPetToParty(this.state, 'rufino');
      addPetToParty(this.state, 'berlioz');
      addPetToParty(this.state, 'bacco');
      return;
    }
    if (action === 'close') {
      this.isInDialogue = false;
      this.canMove = true;
      return;
    }
    const line = getDialogue('intro', action);
    if (line) {
      this.dialogue.show(line, (a) => this.handleDialogueAction(a));
    } else {
      this.isInDialogue = false;
      this.canMove = true;
    }
  }

  private updatePlayerPosition(): void {
    this.player.setPosition(this.playerX, this.playerY);
  }

  // Se borran drawPlayer y drawPet
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

    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      this.checkInteraction();
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
          this.dialogue.show(line, (a) => this.handleDialogueAction(a));
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
          this.dialogue.show(line, (a) => this.handleDialogueAction(a));
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
