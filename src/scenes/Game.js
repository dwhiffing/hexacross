import HexService from '../services/HexService'
import LinkService from '../services/LinkService'

export const RED = 0xaa3377
export const RED_STRING = '#aa3377'
export const BLUE = 0x339933
export const BLUE_STRING = '#339933'

const STARTING_COORDS = [
  [{ x: 3, y: 0, color: RED }, { x: 5, y: 0, color: RED }],
  [{ x: 3, y: 8, color: BLUE }, { x: 5, y: 8, color: BLUE }],
  // [{ x: 3, y: 6, color: 0xaaaaaa }, { x: 5, y: 2, color: 0xaaaaaa }],
]

const SCORES = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 1, 1, 2, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [0, 2, 0, 1, 2, 1, 0, 2],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 2, 1, 1, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const TURN_DURATION = 10000

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    })
  }

  create() {
    this.activeTurnColor = RED
    this.hexService = new HexService(this)
    this.setScale()
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

    this.hexService.hexGrid.forEach((hex) => {
      const score = SCORES[hex.y][hex.x]
      hex.hexObject.setScore(score)
      if (hex.score > 0) {
        hex.hexObject.textObject.text = `${hex.score}`
        hex.hexObject.textObject.alpha = 1
      }
    })

    this.turnTimer = this.time.delayedCall(TURN_DURATION, this.nextTurn, [], this)
    this.redTurnTimerBar = this.add.graphics({ fillStyle: { color: RED } })
    this.blueTurnTimerBar = this.add.graphics({ fillStyle: { color: BLUE } })
    const rect = new Phaser.Geom.Rectangle(
      0,
      this.game.config.height - 30,
      this.game.config.width,
      30,
    )
    this.redTurnTimerBar.fillRectShape(rect)
    this.blueTurnTimerBar.fillRectShape(rect)
    this.blueTurnTimerBar.setScale(0)
    this.redTurnTimerBar.setScale(0)

    this.redScoreTextObject = this.add.text(10, 10, '0', {
      fontFamily: 'Arial',
      fontSize: 26,
      color: RED_STRING,
      align: 'left',
    })

    this.blueScoreTextObject = this.add.text(this.game.config.width - 50, 10, '0', {
      fontFamily: 'Arial',
      fontSize: 26,
      color: BLUE_STRING,
      align: 'left',
    })
    this.redScore = 0
    this.blueScore = 0
    this.blueHexes = []
    this.redHexes = []

    const { canvas } = this.sys.game
    const deviceFullscreen = this.sys.game.device.fullscreen
    this.toggleFullscreen = function () {
      canvas[deviceFullscreen.request]()
      setTimeout(window.resize, 5000)
    }

    const restart = this.add
      .image(this.game.config.width - 40, this.game.config.height - 70, 'fullscreen')
      .setInteractive()
    restart.on('pointerup', this.restart)
    restart.setScale(0.25)

    document.querySelector('#phaser-example').addEventListener('click', this.toggleFullscreen)

    this.resize()
  }

  update() {
    if (this.activeTurnColor === BLUE) {
      this.blueTurnTimerBar.setScale(1 - this.turnTimer.getProgress(), 1)
      this.redTurnTimerBar.setScale(0)
    } else {
      this.blueTurnTimerBar.setScale(0)
      this.redTurnTimerBar.setScale(1 - this.turnTimer.getProgress(), 1)
    }
  }

  nextTurn() {
    this.turnTimer = this.time.delayedCall(TURN_DURATION, this.nextTurn, [], this)
    this.linkService.drawLinks()
    this.destroyIntersection()
    this.captureNodes()
    this.activeTurnColor = this.activeTurnColor === BLUE ? RED : BLUE
  }

  onMoveMouse(pointer) {
    if (!this.activeHex) {
      this.hexService.hoverHexUnderPointer(pointer)
    }
  }

  onClickMouse(pointer) {
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
    this.blueTurnTimerBar.setScale(0)
    this.redTurnTimerBar.setScale(0)
    this.turnTimer.destroy()
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

    const slice = hexes.slice(1, hexes.length - 1)
    slice.forEach((hex) => {
      hex.hexObject.capture(this.activeTurnColor)
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
    this.redScore = this.redHexes.filter(this.hexesWithScore).length
    this.redScore += this.redHexes
      .filter(this.hexesWithScore)
      .filter(hex => hex.hexObject.score === 2).length
    this.redScoreTextObject.text = `${this.redScore}`

    this.blueScore = this.blueHexes.filter(this.hexesWithScore).length
    this.blueScore += this.blueHexes
      .filter(this.hexesWithScore)
      .filter(hex => hex.hexObject.score === 2).length
    this.blueScoreTextObject.text = `${this.blueScore}`
  }

  hexesWithScore(hex) {
    return !hex.hexObject.destroyed && hex.hexObject.score !== 0
  }

  setScale() {
    const { clientHeight: height, clientWidth: width } = document.documentElement
    if (height < width) {
      this.game.scaleFactor = document.documentElement.clientHeight / 1200
    } else {
      this.game.scaleFactor = document.documentElement.clientWidth / 1200
      if (this.game.scaleFactor < 0.4) {
        this.game.scaleFactor = 0.4
      }
    }
  }

  resize() {
    this.setScale()
    this.hexService.resize(this.game.scaleFactor)
    this.linkService.resize(this.game.scaleFactor)
  }

  restart() {
    this.scene.restart()
  }
}
