import { defineGrid, extendHex } from 'honeycomb-grid'
import Piece from '../sprites/piece'
import Hex from '../sprites/hex'

const HEX_WIDTH = 70
const HEX_HEIGHT = 80
const SECTOR_HEIGHT = (HEX_HEIGHT / 4) * 3
const GRADIENT = HEX_HEIGHT / 4 / (HEX_WIDTH / 2)
const X_OFFSET = 100
const Y_OFFSET = 60

const HexGrid = extendHex({
  size: 40,
  render(hexes, scene) {
    const position = this.toPoint()
    const hex = new Hex(this.x, this.y, position, scene)
    if (!hexes[this.y]) {
      hexes[this.y] = []
    }
    hex.sprite.x += X_OFFSET
    hex.sprite.y += Y_OFFSET

    hexes[this.y][this.x] = hex
  },
})
const Grid = defineGrid(HexGrid)
const hexGrid = HexGrid()

export default class HexService {
  constructor(scene) {
    this.game = scene.game
    this.scene = scene
    this.getHex = this.getHex.bind(this)

    this.possibleMoves = []

    this.hexes = []
    Grid.hexagon({
      radius: 4,
      center: [4, 4],
      onCreate: hex => hex.render(this.hexes, this.scene),
    })

    const hex = this.getHex(2, 2)
    hex.piece = new Piece(this.scene, 0, hex)

    // const hex2 = this.getHex(3, 4)
    // hex2.piece = new Piece(this.scene, 1, hex2)

    scene.input.on('pointermove', this.onMoveMouse.bind(this))
    scene.input.on('pointerdown', this.onClickMouse.bind(this))
  }

  onMoveMouse(pointer) {
    const hoveredHex = this.getHexFromScreenPos(pointer)

    if (
      this.lastHoveredHex
      && !this.lastHoveredHex.active
      && !this.possibleMoves.includes(this.lastHoveredHex)
    ) {
      this.lastHoveredHex.deselect()
    }

    if (hoveredHex && hoveredHex.piece) {
      this.lastHoveredHex = hoveredHex
      hoveredHex.hover()
    }
  }

  onClickMouse(pointer) {
    const clickedHex = this.getHexFromScreenPos(pointer)
    const lastActivePiece = this.activeHex ? this.activeHex.piece : null

    if (!clickedHex) {
      return
    }

    if (this.activeHex) {
      if (this.possibleMoves.includes(clickedHex)) {
        this.activeHex.movePiece(clickedHex)
      }
      this.deselectActiveHex()
    }

    if (clickedHex.piece && lastActivePiece !== clickedHex.piece && !this.activeHex) {
      this.selectHex(clickedHex)
    }
  }

  selectHex(hex) {
    if (hex.piece) {
      this.activeHex = hex
      this.activeHex.select()
      this.possibleMoves = this.activeHex.piece.getPossibleMoves(this.getHex)
      this.possibleMoves.forEach(move => move.hover())
    }
  }

  deselectActiveHex() {
    this.activeHex.deselect()
    this.activeHex = null
    this.possibleMoves.forEach(hex => hex.deselect())
    this.possibleMoves = []
  }

  getHex(x, y) {
    return this.hexes[y] && this.hexes[y][x]
  }

  getHexFromScreenPos({ x: mouseX, y: mouseY }) {
    const hex = hexGrid.fromPoint(mouseX - 70, mouseY - 20)
    if (!this.hexes[hex.y]) {
      return
    }

    return this.hexes[hex.y][hex.x]
  }
}
