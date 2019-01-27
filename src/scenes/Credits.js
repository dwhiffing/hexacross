export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Credits',
    })
  }

  create() {
    const { clientHeight: height, clientWidth: width } = document.documentElement
    if (height < width) {
      this.game.scaleFactor = document.documentElement.clientHeight / 1200
    } else {
      this.game.scaleFactor = document.documentElement.clientWidth / 1200
      if (this.game.scaleFactor < 0.4) {
        this.game.scaleFactor = 0.4
      }
    }

    this.bubble = this.add.sprite(
      document.documentElement.clientWidth / 2,
      document.documentElement.clientHeight / 2,
      'credits',
    )
    this.bubble.setScale(this.game.scaleFactor)

    this.play = this.add
      .image(document.documentElement.clientWidth / 2, 800, 'play')
      .setInteractive()

    this.play.setScale(this.game.scaleFactor * 0.5)

    this.play.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
