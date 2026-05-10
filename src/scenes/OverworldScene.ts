import Phaser from 'phaser';
import { TILE, TILE_COLORS, COLLISION_TILES, createMapData, MAP_GUERNICA } from '../data/maps';
import { getMapUADE } from '../data/maps';
import { getDialogue } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { musicManager } from '../systems/MusicManager';
import type { GameState } from '../systems/BattleSystem';
import { addPetToParty } from '../systems/BattleSystem';

type ZoneConfig = 'guernica' | 'uade';

const ZONE_CONFIGS: Record<ZoneConfig, {
  map: number[][]; music: string; encounterTiles: { x: number; y: number; zombie: string }[];
  npcs: { id: string; tx: number; ty: number; color: number; color2: number; dialogueScene: string; dialogueKey: string }[];
  transitions: { tx: number; ty: number; target: string; targetX: number; targetY: number; label?: string }[];
  encounterDialogue: string;
}> = {
  guernica: {
    map: MAP_GUERNICA, music: 'overworld',
    encounterTiles: [{ x: 9, y: 3, zombie: 'walker' }],
    npcs: [],
    transitions: [{ tx: 12, ty: 18, target: 'LoadingScene', targetX: 0, targetY: 0 }],
    encounterDialogue: 'rufino_encounter',
  },
  uade: {
    map: getMapUADE(), music: 'uade',
    encounterTiles: [
      { x: 6, y: 10, zombie: 'student_zombie' },
      { x: 18, y: 12, zombie: 'student_zombie' },
      { x: 12, y: 15, zombie: 'benja' },
    ],
    npcs: [
      { id: 'tiziano', tx: 12, ty: 5, color: 0xddaa66, color2: 0x000000, dialogueScene: 'tiziano_uade', dialogueKey: 'start' },
    ],
    transitions: [{ tx: 12, ty: 18, target: 'FinalScene', targetX: 0, targetY: 0 }],
    encounterDialogue: 'bacco_encounter',
  },
};

export class OverworldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerX = 4 * TILE;
  private playerY = TILE;
  private dialogue!: DialogueManager;
  private state!: GameState;
  private canMove = true;
  private isInDialogue = false;
  private zone!: ZoneConfig;
  private config!: typeof ZONE_CONFIGS[ZoneConfig];
  private npcSprites: { id: string; sprite: Phaser.GameObjects.Sprite; tx: number; ty: number; dialogueScene: string; dialogueKey: string }[] = [];
  private encounterTilesTriggered = new Set<string>();
  private activePetSprites: Phaser.GameObjects.Sprite[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private space!: Phaser.Input.Keyboard.Key;
  private firstEncounterDone = false;
  private tizianoTalked = false;
  private benjaTriggered = false;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data: { zone?: string; playerX?: number; playerY?: number }): void {
    this.zone = (data.zone as ZoneConfig) || 'guernica';
    this.config = ZONE_CONFIGS[this.zone];
    this.playerX = data.playerX ?? (4 * TILE);
    this.playerY = data.playerY ?? (1 * TILE);
    this.encounterTilesTriggered.clear();
    this.npcSprites = [];
    this.activePetSprites = [];
    this.firstEncounterDone = false;
    this.tizianoTalked = false;
    this.benjaTriggered = false;
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    if (!this.state) {
      this.state = { party: [], atunCount: 3, hasBackpack: true, defeatedBenja: false, collectedKey: false, currentPetIndex: 0, flags: {}, playerX: 0, playerY: 0, zone: 'guernica', completedTutorial: true };
      this.registry.set('gameState', this.state);
    }
    this.state.zone = this.zone === 'guernica' ? 'guernica' : 'uade';

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    musicManager.start(this.config.music);
    this.cameras.main.setBackgroundColor('#000000');

    // Fondo
    this.add.image(400, 300, this.zone === 'guernica' ? 'bg_guernica' : 'bg_uade').setDepth(-10);

    const map = createMapData(this.config.map);

    this.player = this.add.sprite(this.playerX, this.playerY, 'valeria');
    this.player.setOrigin(0.5, 1);

    this.config.npcs.forEach(n => {
      const spr = this.add.sprite(n.tx * TILE, n.ty * TILE, n.id);
      spr.setOrigin(0.5, 1);
      this.npcSprites.push({ sprite: spr, ...n });
    });

    this.state.party.forEach((_p, i) => {
      const spr = this.add.sprite(this.playerX - 20 + i * 16, this.playerY - 28, _p.petId);
      spr.setOrigin(0.5, 1);
      this.activePetSprites.push(spr);
    });

    this.dialogue = new DialogueManager(this);

    if (this.zone === 'guernica' && !this.state.completedTutorial) {
      this.time.delayedCall(500, () => this.triggerTutorial());
    }
  }

  private triggerTutorial(): void {
    this.isInDialogue = true;
    this.canMove = false;
    const line = getDialogue('rufino_encounter', 'start');
    if (line) {
      this.dialogue.show(line, (action) => {
        if (action === 'battle_rufino' || action === 'battle') {
          this.firstEncounterDone = true;
          this.state.completedTutorial = true;
          this.state.flags.captured_rufino = true;
          addPetToParty(this.state, 'rufino');
          musicManager.stop();
          this.scene.launch('BattleScene', {
            zombie: 'walker', petJoin: 'rufino',
            returnScene: 'OverworldScene', returnData: { zone: this.zone, playerX: this.playerX, playerY: this.playerY },
          });
          this.scene.pause();
        } else {
          this.isInDialogue = false;
          this.canMove = true;
        }
      });
    }
  }

  // Se borran drawPlayer, updatePlayerSprite, drawNPC, drawPetMini

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
      const map = this.config.map;
      if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        if (!COLLISION_TILES.has(map[tileY][tileX])) {
          this.playerX = nx; this.playerY = ny;
          this.player.setPosition(this.playerX, this.playerY);
        }
      }
    }

    this.activePetSprites.forEach((g, i) => {
      g.setPosition(this.playerX - 20 + i * 16, this.playerY - 28);
    });

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
        if (n.id === 'tiziano') this.tizianoTalked = true;
        const line = getDialogue(n.dialogueScene, n.dialogueKey);
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
      const dist = Math.abs(this.playerX - t.tx * TILE) + Math.abs(this.playerY - t.ty * TILE);
      if (dist < TILE) {
        musicManager.stop();
        if (t.target === 'LoadingScene') {
          this.scene.start('LoadingScene', {
            nextScene: 'OfficeScene', type: 'tren',
            targetX: t.targetX, targetY: t.targetY,
            zone: '',
          });
        } else if (t.target === 'FinalScene') {
          this.scene.start('FinalScene', {});
        }
        return;
      }
    }

    for (const et of this.config.encounterTiles) {
      const dist = Math.abs(this.playerX - et.x * TILE) + Math.abs(this.playerY - et.y * TILE);
      const key = `${et.x},${et.y}`;
      if (dist < TILE && !this.encounterTilesTriggered.has(key)) {
        this.encounterTilesTriggered.add(key);
        this.isInDialogue = true;
        this.canMove = false;

        if (et.zombie === 'benja') {
          if (!this.benjaTriggered) this.triggerBenjaFight();
          return;
        }

        const line = getDialogue(this.config.encounterDialogue, 'start');
        if (line) {
          this.dialogue.show(line, (action) => {
            if (action === 'battle' || action.includes('battle')) {
              musicManager.stop();
              this.scene.launch('BattleScene', {
                zombie: et.zombie, petJoin: 'bacco',
                returnScene: 'OverworldScene', returnData: { zone: this.zone, playerX: this.playerX, playerY: this.playerY },
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

    if (this.zone === 'uade' && this.encounterTilesTriggered.size >= 2 && !this.benjaTriggered) {
      this.triggerBenjaFight();
    }
  }

  private triggerBenjaFight(): void {
    this.benjaTriggered = true;
    this.isInDialogue = true;
    this.canMove = false;
    const line = getDialogue('benja_final_boss', 'start');
    if (line) {
      this.dialogue.show(line, (action) => {
        if (action === 'battle_benja' || action === 'benja_fight') {
          musicManager.stop();
          this.scene.launch('BattleScene', {
            zombie: 'benja', petJoin: null,
            returnScene: 'OverworldScene', returnData: { zone: this.zone, playerX: this.playerX, playerY: this.playerY },
            isBoss: true,
          });
          this.scene.pause();
        } else {
          const l2 = getDialogue('benja_final_boss', action);
          if (l2) {
            this.dialogue.show(l2, (act) => {
              if (act === 'battle_benja' || act === 'benja_fight') {
                musicManager.stop();
                this.scene.launch('BattleScene', {
                  zombie: 'benja', petJoin: null,
                  returnScene: 'OverworldScene', returnData: { zone: this.zone, playerX: this.playerX, playerY: this.playerY },
                  isBoss: true,
                });
                this.scene.pause();
              }
            });
          } else {
            this.canMove = true;
            this.isInDialogue = false;
          }
        }
      });
    }
  }
}
