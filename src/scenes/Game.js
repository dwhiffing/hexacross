import HexService from '../services/HexService'
import InterfaceService from '../services/InterfaceService'
import MutatorService from '../services/MutatorService'
import { RED, BLUE } from '../constants'
import PlayerService from '../services/PlayerService'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  create() {
    this.nextTurn = this.nextTurn.bind(this)

    this.sounds = {}
    this.sounds.recapture = this.sound.add('recaptureNodeSound')
    this.sounds.capture = this.sound.add('captureNodeSound')
    this.sounds.move = this.sound.add('moveToNodeSound')
    this.sounds.click = this.sound.add('clickSound')
    this.sounds.destroy = this.sound.add('destroyNodeSound')

    this.hexService = new HexService(this)
    this.playerService = new PlayerService(this)
    this.interfaceService = new InterfaceService(this)
    this.mutatorService = new MutatorService(this)

    this.data.set('turnIndex', 11)
    this.data.set('hexService', this.hexService)
    this.data.set('playerService', this.playerService)
    this.data.set('interfaceService', this.interfaceService)
    this.data.set('mutatorService', this.mutatorService)

    this.events.on('resize', this.resize.bind(this))
    this.input.on('pointermove', this.onMoveMouse.bind(this))
    this.input.on('pointerdown', this.onClickMouse.bind(this))

    this.resize()
  }

  nextTurn() {
    this.sounds.move.play()
    this.data.values.turnIndex--
    this.interfaceService.updateTurnText(this.data.values.turnIndex)

    this.mutatorService.applyMutators(this.data.values)
    this.playerService.setTurn(this.data.turnIndex)
    this.hexService.deselectHex()
  }

  onMoveMouse(pointer) {
    if (!this.activeHex) {
      this.hexService.hoverHexUnderPointer(pointer)
    }
  }

  onClickMouse(pointer) {
    this.hexService.onClick(pointer)
  }

  resize() {
    this.game.setScaleFactor()
    this.hexService.resize(this.game.scaleFactor)
    this.playerService.resize(this.game.scaleFactor)
  }
}
