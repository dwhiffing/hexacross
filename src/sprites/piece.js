export default class Piece {
  constructor(scene, hex, color) {
    this.color = color
    this.scene = scene
    this.sprite = this.scene.add.image(hex.sprite.x, hex.sprite.y - 4, 'tiles', 5)
    this.sprite.scaleX = 0.4
    this.sprite.scaleY = 0.4
  }

  move(toHex) {
    this.scene.tweens.add({
      targets: this.sprite,
      x: toHex.hexObject.sprite.x,
      y: toHex.hexObject.sprite.y - 4,
      ease: 'Power1',
      duration: 500,
      onUpdate: (tween, image) => {
        this.hex.graphics.clear()
        const { x, y } = this.link.sprite
        const line = new Phaser.Geom.Line(x, y, image.x, image.y)
        this.hex.graphics.strokeLineShape(line)
      },
      onComplete: () => {
        this.sprite.y = toHex.hexObject.sprite.y - 4
        this.sprite.x = toHex.hexObject.sprite.x

        this.hex.hexObject.nullifyPiece()
        toHex.piece = this
        this.hex = toHex
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
