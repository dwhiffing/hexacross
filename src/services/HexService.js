import { defineGrid, extendHex } from 'honeycomb-grid'
import compact from 'lodash/compact'
import Hex from '../sprites/hex'

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

export default class HexService {
  constructor(sceneRef) {
    this.game = sceneRef.game
    this.scene = sceneRef
    this.possibleMoves = []
    const size = parseInt(60 * this.game.scaleFactor)
    this.size = size
    const {
      clientHeight: height,
      clientWidth: width,
    } = document.documentElement
    this.xOffset = (width - size * 14) / 2
    this.yOffset = (height - size * 12) / 2
    const { xOffset, yOffset } = this
    this.ExtendedHex = extendHex({
      size,
      render() {
        const position = this.toPoint()
        const hex = new Hex(
          this.x,
          this.y,
          position,
          sceneRef,
          xOffset,
          yOffset,
        )
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

    this.hexGrid.forEach(hex => {
      const score = SCORES[hex.y][hex.x]
      hex.hexObject.setScore(score)
    })
  }

  hoverHexUnderPointer(pointer) {
    const hoveredHex = this.getHexFromScreenPos(pointer)

    if (
      this.lastHoveredHex &&
      !this.lastHoveredHex.active &&
      !this.possibleMoves.includes(this.lastHoveredHex)
    ) {
      this.lastHoveredHex.deselect()
    }

    if (hoveredHex && hoveredHex.hexObject) {
      this.lastHoveredHex = hoveredHex.hexObject
      this.lastHoveredHex.hover()
    }
  }

  selectHex(hex) {
    if (hex.link) {
      const partnerHex = hex.link.link.hex
      hex.hexObject.select()
      this.possibleMoves = this.getPossibleMoves(partnerHex)
      this.possibleMoves.forEach(h => h.hexObject.hover())
      return hex
    }
  }

  getPossibleMoves(hex) {
    const neighbours = []

    // get row
    for (let q = -10; q < 10; q++) {
      neighbours.push(
        this.hexGrid.get(
          hex.cubeToCartesian({
            q,
            r: hex.r,
          }),
        ),
      )
    }

    // get diagonal right
    for (let r = -10; r < 10; r++) {
      neighbours.push(
        this.hexGrid.get(
          hex.cubeToCartesian({
            q: hex.q,
            r,
            s: hex.s,
          }),
        ),
      )
    }

    // get diagonal left
    for (let r = -10; r < 10; r++) {
      neighbours.push(
        this.hexGrid.get(
          hex.cubeToCartesian({
            q: hex.q + r,
            r: hex.r - r,
            s: hex.s,
          }),
        ),
      )
    }

    return compact(neighbours)
  }

  deselectHex(hex) {
    if (!hex) {
      return
    }
    hex.hexObject.deselect()
    this.possibleMoves.forEach(h => h.hexObject.deselect())
    this.possibleMoves = []
  }

  getHexFromScreenPos({ x: mouseX, y: mouseY }) {
    const hexCoords = this.ExtendedHexGrid.pointToHex(
      mouseX - this.xOffset + this.size,
      mouseY - this.yOffset + this.size,
    )
    const hex = this.hexGrid.get(hexCoords)

    return hex
  }

  resize(scale) {
    this.hexGrid.forEach(hex => {
      hex.hexObject.sprite.setScale(scale * 0.26)
    })
  }
}
