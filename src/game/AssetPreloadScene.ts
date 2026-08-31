import Phaser from 'phaser';

const ATLAS_KEY = 'kenney-space-redux';
const SOURCE_COMMIT = 'be747541cd547f1b0d4196f23dcfe1d68ac6452b';
const SOURCE_ROOT = `https://cdn.jsdelivr.net/gh/EyeOfMidas/kenney-spritesheet-parser@${SOURCE_COMMIT}/assets`;

const SEMANTIC_FRAMES: Record<string, string> = {
  'ship-player': 'playerShip1_blue.png',
  'ship-scout': 'playerShip3_blue.png',
  'ship-hunter': 'playerShip2_blue.png',
  'ship-hauler': 'playerShip2_green.png',
  'ship-pirate': 'enemyRed2.png',
  'ship-pirate-1': 'enemyRed1.png',
  'ship-pirate-2': 'enemyRed2.png',
  'ship-pirate-3': 'enemyRed3.png',
  'ship-pirate-4': 'enemyBlack4.png',
  'ship-pirate-5': 'enemyRed5.png',
  asteroid: 'meteorBrown_big1.png',
  ore: 'meteorGrey_small1.png',
  cargo: 'powerupYellow.png',
};

export class AssetPreloadScene extends Phaser.Scene {
  constructor() {
    super('assets');
  }

  preload(): void {
    this.load.setCORS('anonymous');
    this.load.atlasXML(ATLAS_KEY, `${SOURCE_ROOT}/sprites.png`, `${SOURCE_ROOT}/sprites.xml`);
  }

  create(): void {
    let imported = 0;

    if (this.textures.exists(ATLAS_KEY)) {
      for (const [semanticKey, frameName] of Object.entries(SEMANTIC_FRAMES)) {
        if (this.copyAtlasFrame(semanticKey, frameName)) imported += 1;
      }
    }

    this.registry.set('externalAssetCount', imported);
    this.registry.set('externalAssetSource', imported > 0 ? 'Kenney Space Shooter Redux (CC0)' : 'procedural fallback');
    this.scene.start('game');
  }

  private copyAtlasFrame(targetKey: string, frameName: string): boolean {
    const frame = this.textures.getFrame(ATLAS_KEY, frameName);
    if (!frame || this.textures.exists(targetKey)) return false;

    const texture = this.textures.createCanvas(targetKey, frame.cutWidth, frame.cutHeight);
    if (!texture) return false;

    const context = texture.getContext();
    context.clearRect(0, 0, frame.cutWidth, frame.cutHeight);
    context.drawImage(
      frame.source.image as CanvasImageSource,
      frame.cutX,
      frame.cutY,
      frame.cutWidth,
      frame.cutHeight,
      0,
      0,
      frame.cutWidth,
      frame.cutHeight,
    );
    texture.refresh();
    return true;
  }
}
