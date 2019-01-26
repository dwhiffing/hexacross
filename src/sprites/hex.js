const LIT_HEX = 0x888888
const DIM_HEX = 0xffffff
const BRIGHT_HEX = 0xffffff

export default class Hex {
  constructor(y, x, position, scene, xOffset, yOffset) {
    this.scene = scene
    this.sprite = this.scene.add.sprite(position.x + xOffset, position.y + yOffset, 'hexagon')
    this.sprite.displayWidth = 70
    this.sprite.displayHeight = 80
    this.gridX = x
    this.gridY = y
    this.textObject = this.scene.add.text(
      this.sprite.x - 20,
      this.sprite.y - 10,
      `${this.gridX}, ${this.gridY}`,
      {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#ffffff',
        align: 'left',
      },
    )
    this.textObject.alpha = 0
  }

  select() {
    if (this.captured) {
      return
    }
    this.active = true
    this.sprite.setFrame(1)
  }

  deselect() {
    if (this.captured) {
      return
    }
    this.active = false
    this.sprite.setFrame(0)
  }

  hover() {
    if (this.captured) {
      return
    }
    if (!this.active) {
      this.sprite.setFrame(1)
    }
  }

  capture(color) {
    if (this.captured) {
      return
    }
    this.captured = true
    this.sprite.tint = color
  }

  disable() {
    this.sprite.alpha = 0.25
  }

  nullifyPiece() {
    this.piece = null
  }
}
