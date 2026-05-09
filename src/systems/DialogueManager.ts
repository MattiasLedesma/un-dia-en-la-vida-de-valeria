import type { DialogueLine } from '../data/dialogues';

export class DialogueManager {
  private scene: Phaser.Scene;
  private box: Phaser.GameObjects.Graphics | null = null;
  private speakerText: Phaser.GameObjects.Text | null = null;
  private dialogueText: Phaser.GameObjects.Text | null = null;
  private options: Phaser.GameObjects.Text[] = [];
  private isActive = false;
  private callback: ((action?: string) => void) | null = null;
  currentLine: DialogueLine | null = null;
  private charIndex = 0;
  private fullText = '';
  private typeTimer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(line: DialogueLine, callback: (action?: string) => void): void {
    this.isActive = true;
    this.callback = callback;
    this.currentLine = line;
    this.charIndex = 0;
    this.fullText = line.text;
    this.clearOptions();

    const { width, height } = this.scene.scale;

    if (!this.box) {
      this.box = this.scene.add.graphics().setDepth(100);
    }
    this.box.clear();
    this.box.fillStyle(0x000000, 0.85);
    this.box.fillRoundedRect(20, height - 160, width - 40, 140, 8);
    this.box.lineStyle(3, 0xffffff, 0.8);
    this.box.strokeRoundedRect(20, height - 160, width - 40, 140, 8);

    if (!this.speakerText) {
      this.speakerText = this.scene.add.text(40, height - 148, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffcc00',
        fontStyle: 'bold',
      }).setDepth(101);
    }
    this.speakerText.setText(line.speaker);

    if (!this.dialogueText) {
      this.dialogueText = this.scene.add.text(40, height - 120, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: width - 80 },
      }).setDepth(101);
    }

    this.dialogueText.setText('');
    this.typeTimer = 0;

    if (line.options) {
      this.showOptions(line.options, callback);
    }
  }

  update(delta: number): void {
    if (!this.isActive || !this.dialogueText) return;
    if (this.charIndex < this.fullText.length && this.currentLine?.options) return;

    this.typeTimer += delta;
    if (this.typeTimer > 25 && this.charIndex < this.fullText.length) {
      this.dialogueText!.setText(this.fullText.slice(0, this.charIndex + 1));
      this.charIndex++;
      this.typeTimer = 0;
    }
  }

  private showOptions(
    opts: { text: string; next: string }[],
    callback: (action?: string) => void,
  ): void {
    this.clearOptions();

    opts.forEach((opt, i) => {
      const txt = this.scene.add.text(60, 340 + i * 35, `  ${opt.text}`, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#aaddff',
        backgroundColor: '#222244',
        padding: { x: 10, y: 5 },
      }).setDepth(102).setInteractive({ useHandCursor: true });

      txt.on('pointerover', () => txt.setColor('#ffffff'));
      txt.on('pointerout', () => txt.setColor('#aaddff'));
      txt.on('pointerdown', () => {
        this.isActive = false;
        this.clearOptions();
        this.hide();
        callback(opt.next);
      });

      this.options.push(txt);
    });
  }

  private clearOptions(): void {
    this.options.forEach(o => o.destroy());
    this.options = [];
  }

  hide(): void {
    this.isActive = false;
    if (this.box) this.box.clear();
    if (this.speakerText) this.speakerText.setText('');
    if (this.dialogueText) this.dialogueText.setText('');
    this.clearOptions();
  }

  advance(): void {
    if (!this.isActive || !this.callback || !this.currentLine) return;

    if (this.charIndex < this.fullText.length) {
      this.dialogueText?.setText(this.fullText);
      this.charIndex = this.fullText.length;
      if (this.currentLine.options) {
        this.showOptions(this.currentLine.options, this.callback);
      }
      return;
    }

    if (this.currentLine.options) return;

    if (this.currentLine.action) {
      this.isActive = false;
      this.hide();
      this.callback(this.currentLine.action);
      return;
    }

    if (this.currentLine.next) {
      this.callback(this.currentLine.next);
    }
  }

  get active(): boolean {
    return this.isActive;
  }

  destroy(): void {
    this.hide();
    this.box?.destroy();
    this.speakerText?.destroy();
    this.dialogueText?.destroy();
    this.clearOptions();
  }
}
