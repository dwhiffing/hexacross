export default class Piece {
  constructor(scene, hex, color) {
    this.color = color
    this.scene = scene
    this.sprite = this.scene.add.image(hex.sprite.x, hex.sprite.y - 4, 'tiles', 5)
    this.sprite.scaleX = 0.4
    this.sprite.scaleY = 0.4
  }

  move(toHex) {
    this.sprite.y = toHex.hexObject.sprite.y - 4
    this.sprite.x = toHex.hexObject.sprite.x
    this.hex.hexObject.nullifyPiece()
    toHex.piece = this
    this.hex = toHex
    toHex.color = this.hex.color
    if (this.sprite.alpha === 0) {
      this.undisable()
      this.link.disable()
    } else {
      this.disable()
      this.link.undisable()
    }
  }

  disable() {
    this.sprite.alpha = 0
  }

  undisable() {
    this.sprite.alpha = 1
  }
}