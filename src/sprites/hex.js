const LIT_HEX = 0x888888
const DIM_HEX = 0x555555
const BRIGHT_HEX = 0xdddddd

export default class Hex {
  constructor(y, x, position, scene, xOffset, yOffset) {
    this.scene = scene
    this.sprite = this.scene.add.sprite(position.x + xOffset, position.y + yOffset, 'hexagon')
    this.gridX = x
    this.gridY = y
    this.sprite.tint = DIM_HEX
    this.textObject = this.scene.add.text(
      this.sprite.x - 20,
      this.sprite.y - 10,
      `${this.gridX}, ${this.gridY}`,
      {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#ffffff',
        align: 'left',
        alpha: 0.5,
      },
    )
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
