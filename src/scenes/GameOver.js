export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' })
  }

  init(data) {
    this.data = data
  }

  create() {
    const {
      clientHeight: height,
      clientWidth: width,
    } = document.documentElement

    const background = this.add.sprite(width / 2, 150, 'title')
    background.setScale(0.5)

    const play = this.add
      .image(width / 2, height / 2 + height / 3, 'play')
      .setInteractive()
    play.setScale(this.game.scaleFactor * 0.7)
    play.on('pointerdown', () => {
      this.scene.start('Game')
    })

    if (this.data.winnerIndex === -1) {
      const tieText = this.add.text(width / 2, 500, 'Tie!', {
        fontFamily: 'sans-serif',
        fontSize: 68,
      })
      tieText.setOrigin(0.5)
    } else {
      const winText = this.add.sprite(
        width / 2,
        500,
        this.data.winnerIndex === 1 ? 'p2-win' : 'p1-win',
      )
      winText.setScale(this.game.scaleFactor * 0.5)
    }
  }
}
