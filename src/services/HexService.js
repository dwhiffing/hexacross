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
        // hex.textObject.text = `${this.q}, ${this.r}, ${this.s}`
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

    const pair1 = [{ x: 0, y: 4 }, { x: 1, y: 4 }].map((coord) => {
      const hex = this.hexGrid.get(coord)
      const piece = new Piece(scene, hex.hexObject)
      piece.hex = hex
      hex.piece = piece
      return piece
    })
    pair1[0].link = pair1[1]
    pair1[1].link = pair1[0]
    pair1.color = 0xff0000

    const pair2 = [{ x: 8, y: 4 }, { x: 7, y: 4 }].map((coord) => {
      const hex = this.hexGrid.get(coord)
      const piece = new Piece(scene, hex.hexObject)
      piece.hex = hex
      hex.piece = piece
      piece.sprite.setFrame(11)
      return piece
    })
    pair2[0].link = pair2[1]
    pair2[1].link = pair2[0]
    pair2.color = 0x0000ff

    const pair3 = [{ x: 3, y: 6 }, { x: 5, y: 2 }].map((coord) => {
      const hex = this.hexGrid.get(coord)
      const piece = new Piece(scene, hex.hexObject)
      piece.hex = hex
      hex.piece = piece
      piece.sprite.setFrame(4)
      return piece
    })
    pair3[0].link = pair3[1]
    pair3[1].link = pair3[0]
    pair3.color = 0xaaaaaa

    this.pairs = [pair1, pair2, pair3]
    this.drawLinks(this.pairs)

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
        this.drawLinks(this.pairs)
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

  drawLink(pair) {
    if (pair.graphics) {
      pair.graphics.clear()
    }
    pair.graphics = this.scene.add.graphics({ lineStyle: { width: 4, color: pair.color } })
    const line = new Phaser.Geom.Line(
      pair[0].hex.hexObject.sprite.x,
      pair[0].hex.hexObject.sprite.y,
      pair[1].hex.hexObject.sprite.x,
      pair[1].hex.hexObject.sprite.y,
    )
    pair[0].line = line
    pair[1].line = line
    pair.graphics.strokeLineShape(line)
  }

  drawLinks(pairs) {
    pairs.forEach(this.drawLink.bind(this))
    this.captureHex(pairs[0], pairs[2])
    this.captureHex(pairs[1], pairs[2])
  }

  captureHex(pairA, pairB) {
    const lineA = pairA[0].line
    const lineB = pairB[0].line
    const point = new Phaser.Geom.Point()
    Phaser.Geom.Intersects.LineToLine(lineA, lineB, point)
    if (point.x === 0 && point.y === 0) {
      return
    }
    const hex = this.getHexFromScreenPos(point)
    hex.hexObject.capture(pairA.color)
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
