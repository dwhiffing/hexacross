const fontFamily = 'sans-serif'
const fontSize = 24
const color = '#ffffff'

export default class InterfaceService {
  constructor(scene) {
    const {
      clientHeight: height,
      clientWidth: width,
    } = document.documentElement
    this.sceneRef = scene

    this.redScoreTextObject = this.sceneRef.add.text(30, 50, 'P1: 0', {
      fontFamily,
      fontSize,
      color,
    })

    this.blueScoreTextObject = this.sceneRef.add.text(
      this.sceneRef.game.config.width - 30,
      50,
      'P2: 0',
      {
        fontFamily,
        fontSize,
        color,
        align: 'right',
      },
    )
    this.blueScoreTextObject.setOrigin(1, 0)

    this.turnCountText = this.sceneRef.add.text(
      width / 2,
      height - 100,
      'Turns: 10',
      {
        fontFamily,
        fontSize: 32,
        align: 'center',
      },
    )
    this.turnCountText.setOrigin(0.5, 0)

    this.back = this.sceneRef.add
      .text(20, height - 120, 'Exit', {
        fontFamily,
        fontSize,
      })
      .setInteractive()
    this.credits = this.sceneRef.add
      .text(20, height - 70, 'Credits', {
        fontFamily,
        fontSize,
      })
      .setInteractive()

    this.back.on('pointerdown', () => {
      this.sceneRef.scene.start('Menu')
    })

    this.credits.on('pointerdown', () => {
      this.sceneRef.scene.start('Credits')
    })

    const title = this.sceneRef.add.image(
      this.sceneRef.game.config.width / 2,
      70,
      'title',
    )
    title.setScale(this.sceneRef.game.scaleFactor * 0.5)

    this.disableSoundButton = this.sceneRef.add
      .image(
        this.sceneRef.game.config.width - 50,
        this.sceneRef.game.config.height - 70,
        'sound',
      )
      .setInteractive()
    this.disableSoundButton.on('pointerup', this.disableSound.bind(this))
    this.disableSoundButton.setScale(0.065)
  }

  updatePlayerScores(redScore, blueScore) {
    this.redScoreTextObject.text = `P1: ${redScore}`
    this.blueScoreTextObject.text = `P2: ${blueScore}`
  }

  updateTurnText(turn) {
    this.turnCountText.text = `Turns: ${turn}`
  }

  disableSound() {
    this.sceneRef.sound.mute = !this.sceneRef.sound.mute
  }
}
