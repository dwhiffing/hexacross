export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'BlueVictory',
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

    this.p1Win = this.add.sprite(document.documentElement.clientWidth / 2, 500, 'p2-win')
    this.p1Win.setScale(this.game.scaleFactor * 0.5)
    this.p1Win.setInteractive()

    this.p1Win.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
