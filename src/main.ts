import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { RoomScene } from './scenes/RoomScene';
import { OverworldScene } from './scenes/OverworldScene';
import { OfficeScene } from './scenes/OfficeScene';
import { UADEScene } from './scenes/UADEScene';
import { BattleScene } from './scenes/BattleScene';
import { LoadingScene } from './scenes/LoadingScene';
import { FinalScene } from './scenes/FinalScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  parent: 'game',
  scene: [BootScene, RoomScene, OverworldScene, OfficeScene, UADEScene, BattleScene, LoadingScene, FinalScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
