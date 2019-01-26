const LIT_HEX = 0x888888
const DIM_HEX = 0x555555
const BRIGHT_HEX = 0xdddddd

export default class Hex {
  constructor(y, x, width, height, scene) {
    const screenX = (width * x) / 2 + width / 2
    const screenY = height * y * 1.5 + (height / 4) * 3 * (x % 2) + height / 2
    this.scene = scene
    this.sprite = this.scene.add.sprite(screenX, screenY, 'hexagon')
    this.gridX = x
    this.gridY = y
    this.sprite.tint = DIM_HEX
  }

  movePiece(hex) {
    if (this.piece) {
      this.piece.move(hex)
      this.piece = null
    }
  }

  select() {
    this.active = true
    this.sprite.tint = BRIGHT_HEX
  }

  deselect() {
    this.active = false
    this.sprite.tint = DIM_HEX
  }

  hover() {
    if (!this.active) {
      this.sprite.tint = LIT_HEX
    }
  }
}
