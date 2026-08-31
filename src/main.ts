import Phaser from 'phaser';
import './styles.css';
import { AssetPreloadScene } from './game/AssetPreloadScene';
import { GameScene } from './game/GameScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#030711',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  input: {
    activePointers: 4,
  },
  scene: [AssetPreloadScene, GameScene],
});

window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));
