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

    this.ExtendedHex = extendHex({
      size: 40,
      render() {
        const position = this.toPoint()
        const hex = new Hex(this.x, this.y, position, scene, X_OFFSET, Y_OFFSET)
        hex.textObject.text = `${this.q}, ${this.r}, ${this.s}`
        this.hexObject = hex
      },
    })
    this.hexGridPrototype = this.ExtendedHex()
    this.ExtendedHexGrid = defineGrid(this.ExtendedHex)
    this.graphics = this.scene.add.graphics({ lineStyle: { width: 4, color: 0x00ff00 } })

    this.hexGrid = this.ExtendedHexGrid.hexagon({
      radius: 4,
      center: [4, 4],
      onCreate: hex => hex.render(),
    })

    this.pair1 = [{ x: 3, y: 3 }, { x: 4, y: 4 }].map((coord) => {
      const hex = this.hexGrid.get(coord)
      const piece = new Piece(scene, hex.hexObject)
      piece.hex = hex
      hex.piece = piece
      return piece
    })
    this.pair1[0].link = this.pair1[1]
    this.pair1[1].link = this.pair1[0]

    this.pair2 = [{ x: 5, y: 5 }, { x: 6, y: 4 }].map((coord) => {
      const hex = this.hexGrid.get(coord)
      const piece = new Piece(scene, hex.hexObject)
      piece.hex = hex
      hex.piece = piece
      piece.sprite.setFrame(11)
      return piece
    })
    this.pair2[0].link = this.pair2[1]
    this.pair2[1].link = this.pair2[0]

    this.graphics = this.scene.add.graphics({ lineStyle: { width: 4, color: 0x00ff00 } })
    this.drawLinks(this.pair1, this.pair2)

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
        this.drawLinks(this.pair1, this.pair2)
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

  drawLink([pieceA, pieceB]) {
    this.graphics.strokeLineShape(
      new Phaser.Geom.Line(
        pieceA.hex.hexObject.sprite.x,
        pieceA.hex.hexObject.sprite.y,
        pieceB.hex.hexObject.sprite.x,
        pieceB.hex.hexObject.sprite.y,
      ),
    )
  }

  drawLinks(...pairs) {
    this.graphics.clear()
    this.graphics = this.scene.add.graphics({ lineStyle: { width: 4, color: 0x00ff00 } })
    pairs.forEach(this.drawLink.bind(this))
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
