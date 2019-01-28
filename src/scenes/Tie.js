export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Tie',
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

    this.credits = this.add.text(document.documentElement.clientWidth / 2, 500, 'Tie!', {
      fontFamily: 'sans-serif',
      fontSize: 68,
    })

    this.credits.setOrigin(0.5)

    this.background = this.add.sprite(document.documentElement.clientWidth / 2, 150, 'title')
    this.background.setScale(0.5)

    this.play = this.add.image(width / 2, height / 2 + height / 3, 'play').setInteractive()
    this.play.setScale(this.game.scaleFactor * 0.7)
    this.play.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
