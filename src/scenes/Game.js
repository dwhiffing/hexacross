import HexService from '../services/HexService'
import LinkService from '../services/LinkService'

export const RED = 0xaa3377
export const RED_STRING = '#aa3377'
export const BLUE = 0x339933
export const BLUE_STRING = '#339933'
export const ANIMATION_SPEED = 1

const STARTING_COORDS = [
  [{ x: 3, y: 0, color: RED }, { x: 5, y: 0, color: RED }],
  [{ x: 3, y: 8, color: BLUE }, { x: 5, y: 8, color: BLUE }],
]

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    })
  }

  create() {
    this.sounds = {}
    this.sounds.recapture = this.sound.add('recaptureNodeSound')
    this.sounds.capture = this.sound.add('captureNodeSound')
    this.sounds.move = this.sound.add('moveToNodeSound')
    this.sounds.click = this.sound.add('clickSound')
    this.sounds.destroy = this.sound.add('destroyNodeSound')

    this.turn = 10
    this.activeTurnColor = RED
    this.hexService = new HexService(this)
    this.game.setScaleFactor()
    this.hexService.init()

    this.pairs = STARTING_COORDS.map(coordPair => coordPair.map((coord, index) => {
      const hex = this.hexService.hexGrid.get(coord)
      hex.index = index
      hex.color = coord.color
      return hex
    }))

    this.linkService = new LinkService(this, this.pairs)

    this.events.on('resize', this.resize.bind(this))
    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.redScoreTextObject = this.add.text(30, 50, 'P1: 0', {
      fontFamily: 'sans-serif',
      fontSize: 24,
      color: '#ffffff',
      align: 'left',
    })

    this.blueScoreTextObject = this.add.text(this.game.config.width - 30, 50, 'P2: 0', {
      fontFamily: 'sans-serif',
      fontSize: 24,
      color: '#ffffff',
      align: 'right',
    })
    this.blueScoreTextObject.setOrigin(1, 0)
    this.redScore = 0
    this.blueScore = 0
    this.blueHexes = []
    this.redHexes = []

    this.turnCountText = this.add.text(
      document.documentElement.clientWidth / 2,
      document.documentElement.clientHeight - 100,
      'Turns: 10',
      {
        fontFamily: 'sans-serif',
        fontSize: 32,
        align: 'center',
      },
    )
    this.turnCountText.setOrigin(0.5, 0)

    this.back = this.add
      .text(20, document.documentElement.clientHeight - 120, 'Exit', {
        fontFamily: 'sans-serif',
        fontSize: 24,
      })
      .setInteractive()
    this.credits = this.add
      .text(20, document.documentElement.clientHeight - 70, 'Credits', {
        fontFamily: 'sans-serif',
        fontSize: 24,
      })
      .setInteractive()

    this.back.on('pointerdown', () => {
      this.scene.start('Menu')
    })

    this.credits.on('pointerdown', () => {
      this.scene.start('Credits')
    })

    const title = this.add.image(this.game.config.width / 2, 70, 'title')
    title.setScale(this.game.scaleFactor * 0.5)

    this.disableSoundButton = this.add
      .image(this.game.config.width - 50, this.game.config.height - 70, 'sound')
      .setInteractive()
    this.disableSoundButton.on('pointerup', this.disableSound.bind(this))
    this.disableSoundButton.setScale(0.065)

    this.resize()
  }

  nextTurn() {
    this.sounds.move.play()
    this.linkService.drawLinks(this.activeTurnColor)

    this.destroyIntersection()
    this.captureNodes()
    this.turn--
    this.turnCountText.text = `Turns: ${this.turn}`

    if (this.turn === 0) {
      this.activeTurnColor = null
      let winnerIndex = this.blueScore > this.redScore ? 1 : 0
      if (this.blueScore === this.redScore) {
        winnerIndex = -1
      }
      this.scene.start('GameOver', { winnerIndex })
    }

    this.activeTurnColor = this.activeTurnColor === BLUE ? RED : BLUE
    if (this.activeTurnColor === RED) {
      this.linkService.links[0].emitter.setAlpha(1)
      this.linkService.links[1].emitter.setAlpha(0.25)
    } else {
      this.linkService.links[1].emitter.setAlpha(1)
      this.linkService.links[0].emitter.setAlpha(0.25)
    }

    if (this.activeHex) {
      this.hexService.deselectHex(this.activeHex)
    }
  }

  onMoveMouse(pointer) {
    if (!this.activeHex) {
      this.hexService.hoverHexUnderPointer(pointer)
    }
  }

  onClickMouse(pointer) {
    this.sounds.click.play()
    const clickedHex = this.hexService.getHexFromScreenPos(pointer)
    if (!clickedHex) {
      return
    }

    if (this.activeHex) {
      if (
        !clickedHex.piece
        && !clickedHex.hexObject.destroyed
        && this.hexService.possibleMoves.includes(clickedHex)
      ) {
        this.movePieceToHex(this.activeHex.piece, clickedHex)
        this.activeHex.piece = null
      }
      this.hexService.deselectHex(this.activeHex)
      this.activeHex = null
    } else if (
      clickedHex.piece
      && clickedHex.piece.color === this.activeTurnColor
      && clickedHex.piece.sprite.alpha !== 0
    ) {
      const hex = this.hexService.selectHex(clickedHex)
      this.activeHex = hex
    }
  }

  movePieceToHex(piece, toHex) {
    piece.move(toHex, this.nextTurn.bind(this))
  }

  destroyIntersection() {
    const intersections = this.linkService.getPairIntersections()
    intersections.forEach((intersection) => {
      const hex = this.hexService.getHexFromScreenPos(intersection.point)
      hex.hexObject.destroy(this.activeTurnColor)
    })
  }

  captureNodes() {
    let hexes
    if (this.activeTurnColor === RED) {
      hexes = this.hexService.hexGrid.hexesBetween(
        this.linkService.links[0][0].hex,
        this.linkService.links[0][1].hex,
      )
    } else {
      hexes = this.hexService.hexGrid.hexesBetween(
        this.linkService.links[1][0].hex,
        this.linkService.links[1][1].hex,
      )
    }

    const slice = hexes.slice(1, hexes.length - 1).reverse()

    slice.forEach((hex, index) => {
      hex.hexObject.capture(this.activeTurnColor, index)
      if (hex.captured) {
        return
      }
      if (this.activeTurnColor === RED) {
        if (this.redHexes.indexOf(hex) === -1) {
          this.redHexes.push(hex)
        }
      } else if (this.blueHexes.indexOf(hex) === -1) {
        this.blueHexes.push(hex)
      }
    })
    this.redScore = this.redHexes.filter(this.hexesWithScore).length * 10
    this.redScore
      += this.redHexes.filter(this.hexesWithScore).filter(hex => hex.hexObject.score === 2).length * 10
    this.redScoreTextObject.text = `P1: ${this.redScore}`

    this.blueScore = this.blueHexes.filter(this.hexesWithScore).length * 10
    this.blueScore
      += this.blueHexes.filter(this.hexesWithScore).filter(hex => hex.hexObject.score === 2).length
      * 10
    this.blueScoreTextObject.text = `P2: ${this.blueScore}`
  }

  hexesWithScore(hex) {
    return !hex.hexObject.destroyed && hex.hexObject.score !== 0
  }

  resize() {
    this.game.setScaleFactor()
    this.hexService.resize(this.game.scaleFactor)
    this.linkService.resize(this.game.scaleFactor)
  }

  restart() {
    this.scene.restart()
  }

  disableSound() {
    this.sound.mute = !this.sound.mute
  }
}
