import Piece from '../sprites/piece'
import Hex from '../sprites/hex'

const NUM_HEXES_X = 16
const NUM_HEXES_Y = 8
const HEX_WIDTH = 70
const HEX_HEIGHT = 80
const SECTOR_HEIGHT = (HEX_HEIGHT / 4) * 3
const GRADIENT = HEX_HEIGHT / 4 / (HEX_WIDTH / 2)
const X_OFFSET = 80
const Y_OFFSET = 50

export default class HexService {
  constructor(scene) {
    this.game = scene.game
    this.scene = scene
    this.getHex = this.getHex.bind(this)

    this.possibleMoves = []

    this.hexes = []
    for (let y = 0; y < NUM_HEXES_Y / 2; y += 1) {
      this.hexes[y] = []
      for (let x = 0; x < NUM_HEXES_X; x += 1) {
        const hex = new Hex(y, x, HEX_WIDTH, HEX_HEIGHT, this.scene)
        hex.sprite.x += X_OFFSET
        hex.sprite.y += Y_OFFSET
        this.hexes[y][x] = hex
      }
    }

    for (let j = 0; j < 32; j += 1) {
      const hex = this.getHex(j % 16, j >= 16 ? 3 : 0)
      hex.piece = new Piece(this.scene, j, hex)
    }

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
    if (hoveredHex && hoveredHex.piece && !this.possibleMoves.includes(hoveredHex)) {
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
    let x = Math.floor((mouseX - X_OFFSET) / HEX_WIDTH)
    let y = Math.floor((mouseY - Y_OFFSET) / SECTOR_HEIGHT)
    const diffX = (mouseX - X_OFFSET) % HEX_WIDTH
    const diffY = (mouseY - Y_OFFSET) % SECTOR_HEIGHT

    if (y % 2 === 0) {
      if (diffY < HEX_HEIGHT / 4 - diffX * GRADIENT) {
        x -= 1
        y -= 1
      }
      if (diffY < -HEX_HEIGHT / 4 + diffX * GRADIENT) {
        y -= 1
      }
    } else if (diffX >= HEX_WIDTH / 2) {
      if (diffY < HEX_HEIGHT / 2 - diffX * GRADIENT) {
        y -= 1
      }
    } else if (diffY < diffX * GRADIENT) {
      y -= 1
    } else {
      x -= 1
    }

    return this.getHex(x * 2 + (y % 2), Math.floor(y / 2))
  }
}
