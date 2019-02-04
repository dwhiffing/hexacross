export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Credits' })
  }

  create() {
    const {
      clientHeight: height,
      clientWidth: width,
    } = document.documentElement

    const creditsImage = this.add.sprite(width / 2, height / 2, 'credits')
    creditsImage.setScale(this.game.scaleFactor)

    this.play = this.add.image(width / 2, 800, 'play').setInteractive()
    this.play.setScale(this.game.scaleFactor * 0.5)
    this.play.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
