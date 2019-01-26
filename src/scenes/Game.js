import HexService from '../services/HexService'

export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    })
  }

  create() {
    this.service = new HexService(this)
  }
}
