import { defineGrid, extendHex } from 'honeycomb-grid'
import compact from 'lodash/compact'
import sample from 'lodash/sample'
import Hex from '../sprites/hex'

export default class HexService {
  constructor(scene) {
    this.game = scene.game
    this.scene = scene
  }

  init() {
    this.possibleMoves = []
    const scene = this.scene
    const size = parseInt(60 * this.game.scaleFactor)
    this.size = size
    const { clientHeight: height, clientWidth: width } = document.documentElement
    this.xOffset = (width - size * 14) / 2
    this.yOffset = (height - size * 12) / 2
    const { xOffset, yOffset } = this
    this.ExtendedHex = extendHex({
      size,
      render() {
        const position = this.toPoint()
        const hex = new Hex(this.x, this.y, position, scene, xOffset, yOffset)
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
  }

  hoverHexUnderPointer(pointer) {
    const hoveredHex = this.getHexFromScreenPos(pointer)

    if (
      this.lastHoveredHex
      && !this.lastHoveredHex.active
      && !this.possibleMoves.includes(this.lastHoveredHex)
    ) {
      this.lastHoveredHex.deselect()
    }

    if (hoveredHex && hoveredHex.hexObject) {
      this.lastHoveredHex = hoveredHex.hexObject
      this.lastHoveredHex.hover()
    }
  }

  selectHex(hex) {
    if (hex.piece) {
      const partnerHex = hex.piece.link.hex
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

  getRandomUnoccupiedTile() {
    return sample(this.hexGrid.filter(hex => !hex.piece))
  }

  resize(scale) {
    this.hexGrid.forEach((hex) => {
      hex.hexObject.sprite.setScale(scale * 0.26)
      hex.hexObject.redNodeSprite.setScale(scale * 0.25)
      hex.hexObject.blueNodeSprite.setScale(scale * 0.25)
    })
  }
}
