import sumBy from 'lodash/sumBy'
import HexService from '../services/HexService'
import LinkService from '../services/LinkService'
import InterfaceService from '../services/InterfaceService'

export const RED = 0xaa3377
export const RED_STRING = '#aa3377'
export const BLUE = 0x339933
export const BLUE_STRING = '#339933'
export const ANIMATION_SPEED = 1

const STARTING_COORDS = [
  [{ x: 3, y: 0, color: RED }, { x: 5, y: 0, color: RED }],
  [{ x: 3, y: 8, color: BLUE }, { x: 5, y: 8, color: BLUE }],
]

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    })
  }

  create() {
    this.sounds = {}
    this.sounds.recapture = this.sound.add('recaptureNodeSound')
    this.sounds.capture = this.sound.add('captureNodeSound')
    this.sounds.move = this.sound.add('moveToNodeSound')
    this.sounds.click = this.sound.add('clickSound')
    this.sounds.destroy = this.sound.add('destroyNodeSound')

    this.turn = 10
    this.activeTurnColor = RED
    this.hexService = new HexService(this)
    this.game.setScaleFactor()
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

    this.redScore = 0
    this.blueScore = 0
    this.blueHexes = []
    this.redHexes = []
    this.interfaceService = new InterfaceService(this)
    this.nextTurn = this.nextTurn.bind(this)

    this.resize()
  }

  nextTurn() {
    this.sounds.move.play()
    this.linkService.drawLinks(this.activeTurnColor)

    this.destroyIntersection()
    this.captureNodes()
    this.turn--
    this.interfaceService.updateTurnText(this.turn)

    if (this.turn === 0) {
      this.activeTurnColor = null
      let winnerIndex = this.blueScore > this.redScore ? 1 : 0
      if (this.blueScore === this.redScore) {
        winnerIndex = -1
      }
      this.scene.start('GameOver', { winnerIndex })
    }

    this.activeTurnColor = this.activeTurnColor === BLUE ? RED : BLUE
    if (this.activeTurnColor === RED) {
      this.linkService.links[0].emitter.setAlpha(1)
      this.linkService.links[1].emitter.setAlpha(0.25)
    } else {
      this.linkService.links[1].emitter.setAlpha(1)
      this.linkService.links[0].emitter.setAlpha(0.25)
    }

    if (this.activeHex) {
      this.hexService.deselectHex(this.activeHex)
    }
  }

  onMoveMouse(pointer) {
    if (!this.activeHex) {
      this.hexService.hoverHexUnderPointer(pointer)
    }
  }

  onClickMouse(pointer) {
    this.sounds.click.play()
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
        this.activeHex.piece.move(clickedHex, this.nextTurn)
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

    const slice = hexes.slice(1, hexes.length - 1).reverse()

    slice.forEach((hex, index) => {
      hex.hexObject.capture(this.activeTurnColor, index)
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
    this.redScore = sumBy(this.redHexes, hex => hex.hexObject.score) * 10
    this.blueScore = sumBy(this.blueHexes, hex => hex.hexObject.score) * 10

    this.interfaceService.updatePlayerScores(this.redScore, this.blueScore)
  }

  hexesWithScore(hex) {
    return !hex.hexObject.destroyed && hex.hexObject.score !== 0
  }

  resize() {
    this.game.setScaleFactor()
    this.hexService.resize(this.game.scaleFactor)
    this.linkService.resize(this.game.scaleFactor)
  }
}
