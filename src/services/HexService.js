import { defineGrid, extendHex } from 'honeycomb-grid'
import compact from 'lodash/compact'
import Piece from '../sprites/piece'
import Hex from '../sprites/hex'

const X_OFFSET = 100
const Y_OFFSET = 60

export default class HexService {
  constructor(scene) {
    this.game = scene.game
    this.scene = scene

    this.possibleMoves = []
    const piece = new Piece(scene)
    this.ExtendedHex = extendHex({
      size: 40,
      render() {
        const position = this.toPoint()
        const hex = new Hex(this.x, this.y, position, scene, X_OFFSET, Y_OFFSET)
        if (this.x === 2 && this.y === 2) {
          piece.init(hex)
          this.piece = piece
          hex.piece = this.piece
        }
        hex.textObject.text = `${this.q}, ${this.r}, ${this.s}`
        this.hexObject = hex
      },
    })
    this.hexGridPrototype = this.ExtendedHex()
    this.ExtendedHexGrid = defineGrid(this.ExtendedHex)

    this.hexGrid = this.ExtendedHexGrid.hexagon({
      radius: 4,
      center: [4, 4],
      onCreate: hex => hex.render(),
    })

    this.scene.children.bringToTop(piece.sprite)
    scene.input.on('pointermove', this.onMoveMouse.bind(this))
    scene.input.on('pointerdown', this.onClickMouse.bind(this))
  }

  onMoveMouse(pointer) {
    const hoveredHex = this.getHexFromScreenPos(pointer)

    if (
      this.lastHoveredHex
      && !this.lastHoveredHex.active
      && !this.activeHex
      && !this.possibleMoves.includes(this.lastHoveredHex)
    ) {
      this.lastHoveredHex.deselect()
    }

    if (hoveredHex && hoveredHex.hexObject && !this.activeHex) {
      this.lastHoveredHex = hoveredHex.hexObject
      this.lastHoveredHex.hover()
    }
  }

  onClickMouse(pointer) {
    const clickedHex = this.getHexFromScreenPos(pointer)

    if (!clickedHex) {
      return
    }
    if (this.activeHex) {
      if (this.activeHex !== clickedHex && this.possibleMoves.includes(clickedHex)) {
        this.activePiece.move(clickedHex)
        this.activeHex.piece = null
      }
      this.deselectActiveHex()
    } else if (clickedHex.piece && !this.activeHex) {
      this.selectHex(clickedHex)
    }
  }

  selectHex(hex) {
    if (hex.piece) {
      this.activeHex = hex
      this.activePiece = hex.piece
      this.activeHex.hexObject.select()
      this.possibleMoves = this.getPossibleMoves(this.activeHex)
      this.possibleMoves.forEach(hex => hex.hexObject.hover())
    }
  }

  getPossibleMoves(hex) {
    const neighbours = [] || this.hexGrid.neighborsOf(hex)

    // get row
    for (let q = -10; q < 10; q++) {
      neighbours.push(this.hexGrid.get(hex.cubeToCartesian({ q, r: hex.r })))
    }

    // get diagonal right
    for (let r = -10; r < 10; r++) {
      neighbours.push(this.hexGrid.get(hex.cubeToCartesian({ q: hex.q, r, s: hex.s })))
    }

    // get diagonal left
    for (let r = -10; r < 10; r++) {
      neighbours.push(
        this.hexGrid.get(hex.cubeToCartesian({ q: hex.q + r, r: hex.r - r, s: hex.s })),
      )
    }

    return compact(neighbours)
  }

  deselectActiveHex() {
    this.activeHex.hexObject.deselect()
    this.activeHex = null
    this.possibleMoves.forEach(hex => hex.hexObject.deselect())
    this.possibleMoves = []
  }

  getHexFromScreenPos({ x: mouseX, y: mouseY }) {
    const hexCoords = this.ExtendedHexGrid.pointToHex(mouseX - 70, mouseY - 20)
    const hex = this.hexGrid.get(hexCoords)

    return hex
  }
}
