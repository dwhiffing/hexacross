const hexURI = 'data:image/png;base64,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'
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

    this.load.image('title', 'assets/images/title.png')
    this.load.spritesheet('tiles', 'assets/images/tiles.png', {
      frameWidth: 166,
      frameHeight: 166,
    })
    this.textures.addBase64('hexagon', hexURI)

    this.load.on('complete', () => {
      progress.destroy()
      // this.scene.start('Menu')
      this.scene.start('Game')
    })
  }
}
