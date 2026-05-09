import Phaser from 'phaser';
import { TILE, TILE_COLORS, COLLISION_TILES, createMapData, MAP_GUERNICA } from '../data/maps';
import { getMapUADE } from '../data/maps';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';

type ZoneConfig = 'guernica' | 'uade';

const ZONE_CONFIGS: Record<ZoneConfig, {
  map: number[][];
  music: string;
  encounters: { x: number; y: number; zombie: string; petJoin?: string; dialogue: string }[];
  npcs: { id: string; tx: number; ty: number; color: number; color2: number; dialogueScene: string; dialogueKey: string; encounter?: string }[];
  transitions: { tx: number; ty: number; target: string; targetX: number; targetY: number }[];
  encounterTiles: { x: number; y: number; zombie: string }[];
  encounterDialogue: string;
}> = {
  guernica: {
    map: MAP_GUERNICA,
    music: 'overworld',
    encounters: [
      { x: 9, y: 3, zombie: 'walker', petJoin: 'rufino', dialogue: 'rufino_encounter' },
    ],
    npcs: [],
    transitions: [
      { tx: 12, ty: 18, target: 'LoadingScene', targetX: 0, targetY: 0 },
    ],
    encounterTiles: [
      { x: 9, y: 3, zombie: 'walker' },
    ],
    encounterDialogue: 'rufino_encounter',
  },
  uade: {
    map: getMapUADE(),
    music: 'uade',
    encounters: [
      { x: 6, y: 8, zombie: 'student_zombie', dialogue: 'bacco_encounter' },
      { x: 16, y: 10, zombie: 'student_zombie', petJoin: 'bacco', dialogue: 'bacco_encounter' },
    ],
    npcs: [
      { id: 'tiziano', tx: 12, ty: 5, color: 0xddaa66, color2: 0x000000, dialogueScene: 'tiziano_uade', dialogueKey: 'start' },
    ],
    transitions: [
      { tx: 12, ty: 18, target: 'FinalScene', targetX: 0, targetY: 0 },
    ],
    encounterTiles: [
      { x: 6, y: 8, zombie: 'student_zombie' },
      { x: 16, y: 10, zombie: 'student_zombie' },
    ],
    encounterDialogue: 'bacco_encounter',
  },
};

export class OverworldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Graphics;
  private playerX = 4 * TILE;
  private playerY = TILE;
  private dialogue!: DialogueManager;
  private state!: GameState;
  private canMove = true;
  private isInDialogue = false;
  private zone!: ZoneConfig;
  private config!: typeof ZONE_CONFIGS[ZoneConfig];
  private npcs: { gfx: Phaser.GameObjects.Graphics; tx: number; ty: number; id: string }[] = [];
  private encounterDone = false;
  private pendingBattle: string | null = null;
  private usedEncounters = new Set<string>();
  private npcDialogues = new Map<string, boolean>();
  private encounterTilesTriggered = new Set<string>();
  private activePetSprites: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data: { zone?: string; playerX?: number; playerY?: number }): void {
    this.zone = (data.zone as ZoneConfig) || 'guernica';
    this.config = ZONE_CONFIGS[this.zone];
    this.playerX = data.playerX ?? (4 * TILE);
    this.playerY = data.playerY ?? (1 * TILE);
    this.encounterDone = false;
    this.pendingBattle = null;
    this.npcs = [];
    this.activePetSprites = [];
    this.usedEncounters.clear();
    this.npcDialogues.clear();
    this.encounterTilesTriggered.clear();
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    if (!this.state) {
      this.state = { party: [], atunCount: 3, hasBackpack: true, defeatedBenja: false, collectedKey: false, currentPetIndex: 0, flags: {}, playerX: 0, playerY: 0, zone: 'guernica', completedTutorial: false };
      this.registry.set('gameState', this.state);
    }
    this.state.zone = this.zone === 'guernica' ? 'guernica' : 'uade';

    musicManager.start(this.config.music);
    this.cameras.main.setBackgroundColor('#000000');

    const map = createMapData(this.config.map);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        const g = this.add.graphics();
        g.fillStyle(TILE_COLORS[tile] || 0x000000, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
        if (tile === 3) {
          g.fillStyle(0x1a3d12, 1);
          g.fillCircle(x * TILE + 16, y * TILE + 20, 10);
          g.fillRect(x * TILE + 14, y * TILE + 22, 4, 10);
        }
      }
    }

    this.drawPlayer();

    this.config.npcs.forEach(n => {
      const g = this.add.graphics();
      this.drawNPC(g, n.color, n.color2, n.id);
      g.setPosition(n.tx * TILE, n.ty * TILE);
      this.npcs.push({ gfx: g, tx: n.tx, ty: n.ty, id: n.id });
    });

    this.state.party.forEach(p => {
      if (p.isActive || true) {
        const g = this.add.graphics();
        this.drawPetSprite(g, p.petId);
        g.setPosition(this.playerX - 20 + this.activePetSprites.length * 16, this.playerY - 24);
        this.activePetSprites.push(g);
      }
    });

    this.dialogue = new DialogueManager(this);

    if (this.zone === 'guernica' && !this.state.completedTutorial) {
      this.time.delayedCall(500, () => this.triggerFirstEncounter());
    }
  }

  private triggerFirstEncounter(): void {
    if (this.encounterDone || this.state.completedTutorial) return;
    const enc = this.config.encounters[0];
    if (!enc) return;
    this.isInDialogue = true;
    this.canMove = false;
    const line = getDialogue(enc.dialogue, 'start');
    if (line) {
      this.dialogue.show(line, (action) => this.handleEncounterAction(action, enc));
    }
  }

  private handleEncounterAction(action: string | undefined, enc: typeof ZONE_CONFIGS[ZoneConfig]['encounters'][0]): void {
    if (action === 'battle_rufino' || action === 'battle_berlioz' || action === 'battle_bacco') {
    } else if (action === 'battle' || action === `battle_${enc.petJoin || 'rufino'}`) {
      this.pendingBattle = enc.zombie;
      this.encounterDone = true;
      this.state.completedTutorial = true;
      this.state.flags[`captured_${enc.petJoin || 'rufino'}`] = true;
      musicManager.stop();
      this.scene.launch('BattleScene', {
        zombie: enc.zombie,
        petJoin: enc.petJoin || null,
        returnScene: 'OverworldScene',
        returnData: { zone: this.zone, playerX: this.playerX, playerY: this.playerY },
      });
      this.scene.pause();
      return;
    }

    this.state.completedTutorial = true;
    this.canMove = true;
    this.isInDialogue = false;
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
    p.fillStyle(0x3a3a8a, 1);
    p.fillRect(-1, -12, 2, 2);
    p.setPosition(this.playerX, this.playerY);
  }

  private drawNPC(g: Phaser.GameObjects.Graphics, color: number, color2: number, id: string): void {
    g.fillStyle(0xffccaa, 1);
    g.fillCircle(0, -8, 7);
    if (id === 'benja') {
      g.fillStyle(0x000000, 1);
      g.fillCircle(0, -8, 7);
      g.fillStyle(0x111111, 1);
      g.fillRoundedRect(-7, -1, 14, 20, 2);
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(0, -8, 1);
    } else {
      g.fillStyle(color || 0x4488cc, 1);
      g.fillRoundedRect(-7, -1, 14, 20, 2);
      if (id === 'tiziano') {
        g.fillStyle(0x000000, 1);
        g.fillRect(-4, -4, 8, 3);
        g.fillStyle(0x333333, 1);
        g.fillRect(-2, 0, 4, 1);
      }
    }
    g.fillStyle(0x000000, 1);
    g.fillCircle(-3, -9, 1.5);
    g.fillCircle(3, -9, 1.5);
  }

  private drawPetSprite(g: Phaser.GameObjects.Graphics, petId: string): void {
    const colors: Record<string, number> = { rufino: 0x888888, berlioz: 0xeeeeee, bacco: 0x8b4513 };
    const colors2: Record<string, number> = { rufino: 0x333333, berlioz: 0x111111, bacco: 0x000000 };
    const c = colors[petId] || 0x888888;
    const c2 = colors2[petId] || 0x333333;
    g.fillStyle(c, 1);
    g.fillCircle(0, -4, 5);
    g.fillTriangle(-6, 0, 6, 0, 0, 6);
    g.fillStyle(c2, 1);
    g.fillTriangle(-3, -8, 0, -11, 0, -4);
    g.fillTriangle(3, -8, 0, -11, 0, -4);
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
      const map = this.config.map;
      if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        if (!COLLISION_TILES.has(map[tileY][tileX])) {
          this.playerX = nx;
          this.playerY = ny;
          this.updatePlayerSprite();
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(space)) {
      if (this.isInDialogue) {
        this.dialogue.advance();
      } else {
        this.checkInteraction();
      }
    }

    this.activePetSprites.forEach((g, i) => {
      g.setPosition(this.playerX - 20 + i * 16, this.playerY - 28);
    });
  }

  private checkInteraction(): void {
    const threshold = TILE * 1.5;

    for (const n of this.npcs) {
      const dist = Math.abs(this.playerX - n.tx * TILE) + Math.abs(this.playerY - n.ty * TILE);
      if (dist < threshold) {
        const npcData = this.config.npcs.find(c => c.id === n.id);
        if (!npcData) continue;
        this.isInDialogue = true;
        this.canMove = false;
        const line = getDialogue(npcData.dialogueScene, npcData.dialogueKey);
        if (line) {
          this.dialogue.show(line, (action) => {
            this.isInDialogue = false;
            this.canMove = true;
          });
        }
        return;
      }
    }

    for (const t of this.config.transitions) {
      const tx = t.tx * TILE;
      const ty = t.ty * TILE;
      const dist = Math.abs(this.playerX - tx) + Math.abs(this.playerY - ty);
      if (dist < TILE) {
        musicManager.stop();
        if (t.target === 'LoadingScene') {
          this.scene.start('LoadingScene', {
            nextScene: 'OfficeScene',
            type: this.zone === 'guernica' ? 'tren' : 'subte',
            targetX: t.targetX, targetY: t.targetY,
          });
        } else if (t.target === 'FinalScene') {
          this.scene.start('FinalScene', {});
        }
        return;
      }
    }

    for (const et of this.config.encounterTiles) {
      const ex = et.x * TILE;
      const ey = et.y * TILE;
      const dist = Math.abs(this.playerX - ex) + Math.abs(this.playerY - ey);
      if (dist < TILE && !this.encounterTilesTriggered.has(`${et.x},${et.y}`)) {
        this.encounterTilesTriggered.add(`${et.x},${et.y}`);
        this.isInDialogue = true;
        this.canMove = false;
        const line = getDialogue(this.config.encounterDialogue, 'start');
        if (line) {
          this.dialogue.show(line, (action) => {
            if (action === 'battle' || action === `battle_${et.zombie}`) {
              this.pendingBattle = et.zombie;
              const encPet = this.config.encounters.find(e => e.x === et.x && e.y === et.y);
              musicManager.stop();
              this.scene.launch('BattleScene', {
                zombie: et.zombie,
                petJoin: encPet?.petJoin || null,
                returnScene: 'OverworldScene',
                returnData: { zone: this.zone, playerX: this.playerX, playerY: this.playerY },
              });
              this.scene.pause();
            } else {
              this.canMove = true;
              this.isInDialogue = false;
            }
          });
        }
        return;
      }
    }
  }
}
