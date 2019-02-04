import HexService from '../services/HexService'
import LinkService from '../services/LinkService'
import InterfaceService from '../services/InterfaceService'
import MutatorService from '../services/MutatorService'
import { RED, BLUE } from '../constants'

const STARTING_COORDS = [
  [{ x: 3, y: 0, color: RED }, { x: 5, y: 0, color: RED }],
  [{ x: 3, y: 8, color: BLUE }, { x: 5, y: 8, color: BLUE }],
]

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
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

    this.pairs = STARTING_COORDS.map(coordPair =>
      coordPair.map((coord, index) => {
        const hex = this.hexService.hexGrid.get(coord)
        hex.index = index
        hex.color = coord.color
        return hex
      }),
    )

    this.linkService = new LinkService(this, this.pairs)

    this.events.on('resize', this.resize.bind(this))
    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.interfaceService = new InterfaceService(this)
    this.mutatorService = new MutatorService(this)
    this.nextTurn = this.nextTurn.bind(this)

    this.resize()
  }

  nextTurn() {
    this.sounds.move.play()
    this.linkService.drawLinks()
    this.turn--
    this.interfaceService.updateTurnText(this.turn)

    this.mutatorService.applyMutators({
      activeTurnColor: this.activeTurnColor,
      linkService: this.linkService,
      hexService: this.hexService,
      interfaceService: this.interfaceService,
      turnIndex: this.turn,
    })

    this.activeTurnColor = this.activeTurnColor === BLUE ? RED : BLUE
    this.linkService.links[0].emitter.setAlpha(
      this.activeTurnColor === RED ? 1 : 0.25,
    )
    this.linkService.links[1].emitter.setAlpha(
      this.activeTurnColor === RED ? 0.25 : 1,
    )

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
        !clickedHex.piece &&
        !clickedHex.hexObject.destroyed &&
        this.hexService.possibleMoves.includes(clickedHex)
      ) {
        this.activeHex.piece.move(clickedHex, this.nextTurn)
        this.activeHex.piece = null
      }
      this.hexService.deselectHex(this.activeHex)
      this.activeHex = null
    } else if (
      clickedHex.piece &&
      clickedHex.piece.color === this.activeTurnColor &&
      clickedHex.piece.sprite.alpha !== 0
    ) {
      const hex = this.hexService.selectHex(clickedHex)
      this.activeHex = hex
    }
  }

  resize() {
    this.game.setScaleFactor()
    this.hexService.resize(this.game.scaleFactor)
    this.linkService.resize(this.game.scaleFactor)
  }
}
