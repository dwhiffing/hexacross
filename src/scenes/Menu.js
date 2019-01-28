export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Menu',
    })
  }

  create() {
    const { clientHeight: height, clientWidth: width } = document.documentElement
    if (height < width) {
      this.game.scaleFactor = height / 1200
    } else {
      this.game.scaleFactor = width / 1200
    }

    this.background = this.add.sprite(width / 2, 150, 'title')
    this.background.setScale(this.game.scaleFactor)
    this.bubble = this.add.sprite(width / 2, height / 2, 'menu-bubble')
    this.bubble.setScale(this.game.scaleFactor * 0.85)

    this.play = this.add.image(width / 2, height / 2 + height / 3, 'play').setInteractive()

    this.play.setScale(this.game.scaleFactor * 0.7)

    this.tweens.add({
      targets: this.bubble,
      alpha: 0.75,
      scaleX: this.game.scaleFactor * 0.75,
      scaleY: this.game.scaleFactor * 0.75,
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
