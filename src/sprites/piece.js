export default class Piece {
  constructor(scene, hex) {
    this.index = 5
    this.scene = scene
    this.sprite = this.scene.add.image(hex.sprite.x, hex.sprite.y - 4, 'tiles', this.index)
    this.sprite.scaleX = 0.4
    this.sprite.scaleY = 0.4
  }

  move(hex) {
    this.sprite.y = hex.hexObject.sprite.y - 4
    this.sprite.x = hex.hexObject.sprite.x
    hex.piece = this
  }
}
