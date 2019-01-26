import HexService from '../services/HexService'
import LinkService from '../services/LinkService'

const STARTING_COORDS = [
  [{ x: 0, y: 4, color: 0xff0000 }, { x: 1, y: 4, color: 0xff0000 }],
  [{ x: 8, y: 4, color: 0x0000ff }, { x: 7, y: 4, color: 0x0000ff }],
  [{ x: 3, y: 6, color: 0xaaaaaa }, { x: 5, y: 2, color: 0xaaaaaa }],
]

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    })
  }

  create() {
    this.hexService = new HexService(this)

    const pairs = STARTING_COORDS.map(coordPair => coordPair.map((coord) => {
      const hex = this.hexService.hexGrid.get(coord)
      hex.color = coord.color
      return hex
    }))

    this.linkService = new LinkService(this, pairs)

    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))
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
      this.makeMove(clickedHex)
    } else {
      const hex = this.hexService.selectHex(clickedHex)
      this.activeHex = hex
    }
  }

  makeMove(clickedHex) {
    if (
      this.activeHex !== clickedHex
      && !clickedHex.piece
      && this.hexService.possibleMoves.includes(clickedHex)
    ) {
      this.activeHex.piece.move(clickedHex)
      this.linkService.drawLinks()
      this.captureIntersections()
      this.activeHex.piece = null
    }
    this.hexService.deselectHex(this.activeHex)
    this.activeHex = null
  }

  captureIntersections() {
    const intersections = this.linkService.getPairIntersections()
    intersections.forEach((intersection) => {
      const hex = this.hexService.getHexFromScreenPos(intersection.point)
      hex.hexObject.capture(intersection.color)
    })
  }
}
