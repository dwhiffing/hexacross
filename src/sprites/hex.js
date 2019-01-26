const LIT_HEX = 0x888888
const DIM_HEX = 0x555555
const BRIGHT_HEX = 0xdddddd

export default class Hex {
  constructor(y, x, position, scene) {
    this.scene = scene
    this.sprite = this.scene.add.sprite(position.x, position.y, 'hexagon')
    this.gridX = x
    this.gridY = y
    this.sprite.tint = DIM_HEX
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
