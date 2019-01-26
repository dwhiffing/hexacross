import HexService from '../services/HexService'
import LinkService from '../services/LinkService'

const STARTING_COORDS = [
  [{ x: 0, y: 4, color: 0xff0000 }, { x: 1, y: 4, color: 0xff0000 }],
  [{ x: 8, y: 4, color: 0x0000ff }, { x: 7, y: 4, color: 0x0000ff }],
  // [{ x: 3, y: 6, color: 0xaaaaaa }, { x: 5, y: 2, color: 0xaaaaaa }],
]

const TURN_DURATION = 5000

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    })
  }

  create() {
    this.hexService = new HexService(this)

    this.pairs = STARTING_COORDS.map(coordPair => coordPair.map((coord, index) => {
      const hex = this.hexService.hexGrid.get(coord)
      hex.index = index
      hex.color = coord.color
      return hex
    }))

    this.linkService = new LinkService(this, this.pairs)

    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.turnTimer = this.time.delayedCall(TURN_DURATION, this.nextTurn, [], this)
    this.turnTimerBar = this.add.graphics()
    const rect = new Phaser.Geom.Rectangle(
      0,
      this.game.config.height - 10,
      this.game.config.width,
      10,
    )
    this.turnTimerBar.fillRectShape(rect)
  }

  update() {
    this.turnTimerBar.setScale(this.turnTimer.getProgress(), 1)
  }

  nextTurn() {
    this.turnTimer = this.time.delayedCall(TURN_DURATION, this.nextTurn, [], this)
    this.captureIntersections()
    const pieceA = this.pairs[2][0].piece
    const pieceB = this.pairs[2][1].piece
    if (pieceA.sprite.alpha === 0) {
      this.movePieceToHex(pieceB, this.hexService.getRandomUnoccupiedTile())
    } else {
      this.movePieceToHex(pieceA, this.hexService.getRandomUnoccupiedTile())
    }
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
      if (!clickedHex.piece && this.hexService.possibleMoves.includes(clickedHex)) {
        this.movePieceToHex(this.activeHex.piece, clickedHex)
        this.activeHex.piece = null
      }
      this.hexService.deselectHex(this.activeHex)
      this.activeHex = null
    } else if (clickedHex.color !== 0xaaaaaa && clickedHex.piece.sprite.alpha !== 0) {
      const hex = this.hexService.selectHex(clickedHex)
      this.activeHex = hex
    }
  }

  movePieceToHex(piece, toHex) {
    piece.move(toHex)
    this.linkService.drawLinks()
  }

  captureIntersections() {
    const intersections = this.linkService.getPairIntersections()
    intersections.forEach((intersection) => {
      const hex = this.hexService.getHexFromScreenPos(intersection.point)
      hex.hexObject.capture(intersection.color)
    })
  }
}
