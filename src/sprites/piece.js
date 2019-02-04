import { RED, ANIMATION_SPEED } from '../constants'

export default class Piece {
  constructor(scene, hex, color) {
    this.color = color
    this.scene = scene
    this.sprite = this.scene.add.image(
      hex.sprite.x,
      hex.sprite.y - 2,
      color === RED ? 'handle' : 'handle2',
    )
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
      onUpdate: () => {
        const { x: startX, y: startY } = this.sprite
        const { x: endX, y: endY } = this.link.sprite
        const curve = new Phaser.Curves.Spline([
          startX,
          startY + 200,
          endX,
          endY + 200,
        ])
        this.pair.emitter.setEmitZone({
          type: 'random',
          source: curve,
          quantity: 200,
        })
      },
      onComplete: () => {
        callback()
        this.sprite.y = toHex.hexObject.sprite.y - 2
        this.sprite.x = toHex.hexObject.sprite.x

        const { x: startX, y: startY } = this.sprite
        const { x: endX, y: endY } = this.link.sprite
        const curve = new Phaser.Curves.Spline([
          startX,
          startY + 200,
          endX,
          endY + 200,
        ])
        this.pair.emitter.setEmitZone({
          type: 'random',
          source: curve,
          quantity: 200,
        })

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
