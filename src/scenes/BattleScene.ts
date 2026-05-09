import Phaser from 'phaser';
import { PETS } from '../data/pets';
import { ZOMBIES } from '../data/zombies';
import { musicManager } from '../systems/MusicManager';
import type { GameState, BattleState } from '../systems/BattleSystem';
import { createBattleState, executePlayerAttack, executeZombieAttack, executeCapture, addPetToParty, healParty } from '../systems/BattleSystem';

type BattleButton = {
  text: Phaser.GameObjects.Text;
  bg: Phaser.GameObjects.Graphics;
  action: () => void;
};

export class BattleScene extends Phaser.Scene {
  private state!: GameState;
  private battle!: BattleState;
  private petGfx!: Phaser.GameObjects.Graphics;
  private zombieGfx!: Phaser.GameObjects.Graphics;
  private petHpBar!: Phaser.GameObjects.Graphics;
  private zombieHpBar!: Phaser.GameObjects.Graphics;
  private logText!: Phaser.GameObjects.Text;
  private logLines: string[] = [];
  private buttons: BattleButton[] = [];
  private returnScene = '';
  private returnData: any = {};
  private petJoin: string | null = null;
  private isBoss = false;
  private phase: 'menu' | 'animating' | 'done' = 'menu';
  private animTimer = 0;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: {
    zombie: string;
    petJoin?: string | null;
    returnScene: string;
    returnData: any;
    isBoss?: boolean;
  }): void {
    this.returnScene = data.returnScene;
    this.returnData = data.returnData || {};
    this.petJoin = data.petJoin || null;
    this.isBoss = data.isBoss || false;
    this.buttons = [];
    this.logLines = [];
    this.phase = 'menu';

    this.state = this.registry.get('gameState') as GameState;
    if (!this.state) {
      this.state = { party: [], atunCount: 3, hasBackpack: true, defeatedBenja: false, collectedKey: false, currentPetIndex: 0, flags: {}, playerX: 0, playerY: 0, zone: 'guernica', completedTutorial: true };
      this.registry.set('gameState', this.state);
    }

    const activePet = this.state.party[this.state.currentPetIndex] || this.state.party[0];
    if (activePet) {
      this.battle = createBattleState(activePet, data.zombie as any);
      this.battle.isBoss = this.isBoss;
    }
  }

  create(): void {
    musicManager.start('battle');
    this.cameras.main.setBackgroundColor('#0a0a1e');

    this.add.text(400, 20, '⚔️ COMBATE ⚔️', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444',
    }).setOrigin(0.5);

    this.petGfx = this.add.graphics();
    this.zombieGfx = this.add.graphics();

    this.drawPet();
    this.drawZombie();

    this.petHpBar = this.add.graphics();
    this.zombieHpBar = this.add.graphics();
    this.drawHpBars();

    this.logText = this.add.text(400, 420, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#cccccc',
      wordWrap: { width: 700 }, align: 'center',
    }).setOrigin(0.5);

    if (this.battle) {
      const zDef = ZOMBIES[this.battle.zombieDef];
      this.logLines.push(zDef.introLine);
      this.logLines.push('Elegí una acción:');
    }

    this.updateLog();
    this.createButtons();

    this.state.atunCount = this.state.atunCount ?? 3;
  }

  private drawPet(): void {
    const g = this.petGfx;
    g.clear();
    if (!this.battle) return;

    const pet = this.state.party[this.state.currentPetIndex];
    if (!pet) return;
    const def = PETS[pet.petId];

    g.fillStyle(def.color, 1);
    g.fillCircle(150, 200, 30);
    g.fillTriangle(120, 230, 180, 230, 150, 270);

    g.fillStyle(def.secondaryColor, 1);
    g.fillTriangle(130, 170, 145, 155, 145, 185);
    g.fillTriangle(170, 170, 155, 155, 155, 185);

    g.fillStyle(0xffffff, 1);
    g.fillCircle(140, 190, 6);
    g.fillCircle(160, 190, 6);
    g.fillStyle(0x000000, 1);
    g.fillCircle(140, 190, 3);
    g.fillCircle(160, 190, 3);

    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(150, 280, 50, 10);

    g.fillStyle(0xffffff, 1);
    g.fillRect(125, 147, 50, 8);
    g.fillStyle(0x000000, 1);
    g.fillRect(130, 148, 40, 6);
    g.fillStyle(0x00cc00, 1);
    g.fillRect(130, 148, Math.max(0, (this.battle.petHp / this.battle.petMaxHp) * 40), 6);

    this.add.text(150, 138, `${def.name} ❤️${this.battle.petHp}/${this.battle.petMaxHp}`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(150, 300, def.catchPhrase, {
      fontFamily: 'monospace', fontSize: '10px', color: '#888888',
    }).setOrigin(0.5);
  }

  private drawZombie(): void {
    const g = this.zombieGfx;
    g.clear();
    if (!this.battle) return;

    const zDef = ZOMBIES[this.battle.zombieDef];

    g.fillStyle(zDef.color, 1);
    g.fillCircle(650, 200, 30);
    g.fillRoundedRect(630, 225, 40, 50, 5);

    g.fillStyle(0x000000, 1);
    g.fillCircle(635, 190, 5);
    g.fillCircle(665, 190, 5);
    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(635, 190, 2);
    g.fillCircle(665, 190, 2);

    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(650, 285, 55, 10);

    this.add.text(650, 138, `${zDef.name} 🧟`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff6666',
    }).setOrigin(0.5);

    g.fillStyle(0xffffff, 1);
    g.fillRect(625, 147, 50, 8);
    g.fillStyle(0x000000, 1);
    g.fillRect(630, 148, 40, 6);
    g.fillStyle(0xcc0000, 1);
    g.fillRect(630, 148, Math.max(0, (this.battle.zombieHp / this.battle.zombieMaxHp) * 40), 6);

    this.add.text(650, 157, `❤️${this.battle.zombieHp}/${this.battle.zombieMaxHp}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff6666',
    }).setOrigin(0.5);

    this.add.text(650, 300, zDef.description, {
      fontFamily: 'monospace', fontSize: '9px', color: '#666666',
    }).setOrigin(0.5);
  }

  private drawHpBars(): void {
  }

  private createButtons(): void {
    this.clearButtons();

    const btns = [
      { label: '⚔️ ATACAR', action: () => this.doAttack(0) },
      { label: '🐟 ATÚN', action: () => this.doCapture() },
      { label: '🔄 CAMBIAR', action: () => this.doSwitch() },
      { label: '🏃 HUIDA', action: () => this.doFlee() },
    ];

    btns.forEach((b, i) => {
      const x = 100 + i * 180;
      const y = 340;
      const bg = this.add.graphics();
      bg.fillStyle(0x222244, 1);
      bg.fillRoundedRect(x - 5, y - 5, 160, 40, 5);
      bg.lineStyle(2, 0x4444aa, 1);
      bg.strokeRoundedRect(x - 5, y - 5, 160, 40, 5);
      bg.setInteractive(new Phaser.Geom.Rectangle(x - 5, y - 5, 160, 40), Phaser.Geom.Rectangle.Contains);

      const txt = this.add.text(x + 75, y + 15, b.label, {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.clear().fillStyle(0x333366, 1).fillRoundedRect(x - 5, y - 5, 160, 40, 5).lineStyle(2, 0x6666cc, 1).strokeRoundedRect(x - 5, y - 5, 160, 40, 5));
      bg.on('pointerout', () => bg.clear().fillStyle(0x222244, 1).fillRoundedRect(x - 5, y - 5, 160, 40, 5).lineStyle(2, 0x4444aa, 1).strokeRoundedRect(x - 5, y - 5, 160, 40, 5));
      bg.on('pointerdown', () => {
        if (this.phase !== 'menu') return;
        b.action();
      });

      this.buttons.push({ text: txt, bg, action: b.action });
    });
  }

  private clearButtons(): void {
    this.buttons.forEach(b => { b.bg.destroy(); b.text.destroy(); });
    this.buttons = [];
  }

  private doAttack(index: number): void {
    if (!this.battle || this.phase !== 'menu') return;
    this.phase = 'animating';
    this.clearButtons();

    const activePet = this.state.party[this.state.currentPetIndex];
    if (!activePet) return;

    executePlayerAttack(this.battle, activePet, index);
    this.updateLog();
    musicManager.sfx('hit');

    if (this.battle.battleOver) {
      this.handleBattleEnd();
      return;
    }

    this.time.delayedCall(800, () => {
      executeZombieAttack(this.battle!);
      this.drawPet();
      this.drawZombie();
      this.updateLog();
      musicManager.sfx('hit');

      if (this.battle!.petHp <= 0) {
        this.handlePetFainted();
        return;
      }

      if (!this.battle!.battleOver) {
        this.phase = 'menu';
        this.createButtons();
      }
    });
  }

  private doCapture(): void {
    if (!this.battle || this.phase !== 'menu') return;
    this.phase = 'animating';
    this.clearButtons();

    if ((this.state.atunCount ?? 0) <= 0) {
      this.logLines.push('No tenés atún!');
      this.phase = 'menu';
      this.createButtons();
      return;
    }

    this.state.atunCount--;
    executeCapture(this.battle);
    musicManager.sfx('capture');
    this.updateLog();

    if (this.battle.captured) {
      this.time.delayedCall(800, () => {
        this.logLines.push('¡ZOMBIE CAPTURADO! 🎉');
        this.updateLog();
        this.handleBattleEnd();
      });
    } else {
      this.time.delayedCall(800, () => {
        executeZombieAttack(this.battle!);
        this.drawPet();
        this.drawZombie();
        this.updateLog();
        if (this.battle!.petHp <= 0) {
          this.handlePetFainted();
        } else {
          this.phase = 'menu';
          this.createButtons();
        }
      });
    }
  }

  private doSwitch(): void {
    if (!this.battle || this.phase !== 'menu') return;
    if (this.state.party.length < 2) {
      this.logLines.push('Solo tenés una mascota!');
      this.updateLog();
      return;
    }

    this.state.currentPetIndex = (this.state.currentPetIndex + 1) % this.state.party.length;
    const newPet = this.state.party[this.state.currentPetIndex];
    this.battle.petHp = newPet.currentHp;
    this.battle.petMaxHp = newPet.maxHp;
    this.drawPet();
    this.logLines.push(`Cambiaste a ${PETS[newPet.petId].name}!`);
    this.updateLog();

    this.phase = 'animating';
    this.clearButtons();
    this.time.delayedCall(800, () => {
      executeZombieAttack(this.battle!);
      this.drawPet();
      this.drawZombie();
      this.updateLog();
      if (this.battle!.petHp <= 0) {
        this.handlePetFainted();
      } else {
        this.phase = 'menu';
        this.createButtons();
      }
    });
  }

  private doFlee(): void {
    if (!this.battle || this.phase !== 'menu') return;
    this.logLines.push('Huiste del combate!');
    this.updateLog();
    this.returnToPrevious();
  }

  private handlePetFainted(): void {
    if (!this.battle) return;
    this.logLines.push('Tu mascota fue derrotada!');
    this.updateLog();
    healParty(this.state);
    this.logLines.push('Las mascotas se recuperaron!');
    this.updateLog();
    this.time.delayedCall(1000, () => this.returnToPrevious());
  }

  private handleBattleEnd(): void {
    if (!this.battle) return;

    if (this.petJoin && !this.state.flags[`captured_${this.petJoin}`]) {
      this.state.flags[`captured_${this.petJoin}`] = true;
      addPetToParty(this.state, this.petJoin as any);
      const petName = PETS[this.petJoin as keyof typeof PETS]?.name || this.petJoin;
      this.logLines.push(`🎒 ${petName} se unió a tu mochila!`);
      this.updateLog();
      this.state.currentPetIndex = this.state.party.length - 1;
    }

    if (this.battle.zombieDef === 'benja') {
      this.state.defeatedBenja = true;
      this.logLines.push('🖤 Venciste a BENJA! El camino está libre!');
      this.updateLog();
    }

    this.time.delayedCall(1500, () => this.returnToPrevious());
  }

  private updateLog(): void {
    const lastLines = this.logLines.slice(-4);
    this.logText.setText(lastLines.join('\n'));
  }

  private returnToPrevious(): void {
    musicManager.stop();
    this.scene.stop();
    this.scene.resume(this.returnScene, this.returnData);
    this.state.playerX = this.returnData.playerX || this.state.playerX;
    this.state.playerY = this.returnData.playerY || this.state.playerY;
    this.registry.set('gameState', this.state);
  }

  update(_time: number, delta: number): void {
    this.animTimer += delta;
    if (this.petGfx && this.battle && !this.battle.battleOver) {
      this.petGfx.setPosition(Math.sin(this.animTimer * 0.003) * 3, 0);
      this.zombieGfx.setPosition(Math.sin(this.animTimer * 0.003 + Math.PI) * 3, 0);
    }
  }
}
