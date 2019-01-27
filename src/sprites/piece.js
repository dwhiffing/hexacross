import { ANIMATION_SPEED } from '../scenes/Game'

export default class Piece {
  constructor(scene, hex, color) {
    this.color = color
    this.scene = scene
    this.sprite = this.scene.add.image(hex.sprite.x, hex.sprite.y - 2, 'handle')
    this.sprite.displayWidth = 55
    this.sprite.displayHeight = 55
  }

  move(toHex, callback) {
    this.hex = toHex
    this.scene.tweens.add({
      targets: this.sprite,
      x: toHex.hexObject.sprite.x,
      y: toHex.hexObject.sprite.y - 2,
      ease: 'Power1',
      duration: 500 * ANIMATION_SPEED,
      onUpdate: (tween, image) => {
        this.pair.graphics.clear()
        const { x, y } = this.link.sprite
        const line = new Phaser.Geom.Line(x, y, image.x, image.y)
        this.pair.graphics.strokeLineShape(line)
      },
      onComplete: () => {
        callback()
        this.sprite.y = toHex.hexObject.sprite.y - 2
        this.sprite.x = toHex.hexObject.sprite.x

        this.hex.hexObject.nullifyPiece()
        toHex.piece = this
        toHex.color = this.hex.color
      },
    })
  }

  disable() {
    this.sprite.alpha = 0
  }

  undisable() {
    this.sprite.alpha = 1
  }
}
