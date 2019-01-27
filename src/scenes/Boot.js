export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Boot',
    })
  }

  preload() {
    const progress = this.add.graphics()
    this.load.on('progress', (value) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60)
    })

    this.load.image('coin', 'assets/images/coin.png')
    this.load.image('nodeGreen', 'assets/images/hexg.png')
    this.load.image('nodePink', 'assets/images/hexp.png')
    this.load.image('title', 'assets/images/title.png')
    this.load.spritesheet('tiles', 'assets/images/tiles.png', {
      frameWidth: 166,
      frameHeight: 166,
    })
    this.load.image('handle', 'assets/images/handle1.png')
    this.load.spritesheet('hexagon', 'assets/images/hex.png', {
      frameWidth: 390,
      frameHeight: 450,
    })
    // this.textures.addBase64('hexagon', hexURI)

    this.load.on('complete', () => {
      progress.destroy()
      // this.scene.start('Menu')
      this.scene.start('Game')
    })
  }
}