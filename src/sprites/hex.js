export default class Hex {
  constructor(y, x, position, scene, xOffset, yOffset) {
    this.scene = scene
    this.sprite = this.scene.add.sprite(position.x + xOffset, position.y + yOffset, 'hexagon')
    this.sprite.displayWidth = 70
    this.sprite.displayHeight = 80
    this.gridX = x
    this.gridY = y
    this.coinSprite = this.scene.add.sprite(position.x + xOffset, position.y + yOffset, 'coin')
    this.coinSprite.alpha = 0
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
    this.score = 0
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
    if (this.captured || this.score === 0) {
      return
    }
    this.captured = true
    this.sprite.tint = color
  }

  destroy() {
    this.destroyed = true
    this.sprite.alpha = 0
    this.coinSprite.alpha = 0
    this.textObject.alpha = 0
  }

  nullifyPiece() {
    this.piece = null
  }

  setScore(score) {
    if (score > 0) {
      this.coinSprite.alpha = 1
    } else {
      this.coinSprite.alpha = 0
    }

    this.score = score
    if (score === 2) {
      this.coinSprite.setScale(0.5)
    } else if (score === 1) {
      this.coinSprite.setScale(0.2)
    }
  }
}
