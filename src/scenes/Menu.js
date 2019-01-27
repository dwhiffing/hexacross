export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Menu',
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

    this.background = this.add.sprite(document.documentElement.clientWidth / 2, 150, 'title')
    this.background.setScale(0.5)
    this.bubble = this.add.sprite(document.documentElement.clientWidth / 2, 500, 'menu-bubble')
    this.bubble.setScale(this.game.scaleFactor)

    this.play = this.add
      .image(document.documentElement.clientWidth / 2, 800, 'play')
      .setInteractive()

    this.play.setScale(this.game.scaleFactor * 0.5)

    this.tweens.add({
      targets: this.bubble,
      alpha: 0.75,
      scaleX: this.game.scaleFactor * 0.95,
      scaleY: this.game.scaleFactor * 0.95,
      ease: 'Quad.easeInOut',
      duration: 2500,
      yoyo: true,
      repeat: true,
    })

    this.play.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
