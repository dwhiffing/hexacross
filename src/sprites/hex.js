import { RED } from '../scenes/Game'

export default class Hex {
  constructor(y, x, position, scene, xOffset = 0, yOffset = 0) {
    this.scene = scene
    this.sprite = this.scene.add.sprite(position.x + xOffset, position.y + yOffset, 'hexagon')

    this.gridX = x
    this.gridY = y
    this.coinSprite = this.scene.add.sprite(position.x + xOffset, position.y + yOffset, 'coin')
    this.coinSprite.alpha = 0
    this.redNodeSprite = this.scene.add.sprite(
      position.x + xOffset,
      position.y + yOffset,
      'nodePink',
    )
    this.redNodeSprite.alpha = 0
    this.redNodeSprite.setScale(0)
    this.blueNodeSprite = this.scene.add.sprite(
      position.x + xOffset,
      position.y + yOffset,
      'nodeGreen',
    )
    this.blueNodeSprite.alpha = 0
    this.blueNodeSprite.setScale(0)
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

  capture(color, index = 0) {
    if (this.captured || this.score === 0) {
      return
    }
    this.captured = true
    this.tweenNode(color, index)
  }

  tweenNode(color, index) {
    const sprite = color === RED ? this.redNodeSprite : this.blueNodeSprite
    if (!this.particles) {
      this.particles = this.scene.add.particles('particle-green')
      this.emitter = this.particles.createEmitter({
        speed: { min: -250, max: 250 },
        scale: { start: 0.3, end: 0 },
        alpha: 0.5,
        // blendMode: 'ADD',
        active: false,
        quantity: 15,
        lifespan: { min: 600, max: 900 },
        gravityY: 0,
      })
    }
    this.scene.tweens.add({
      targets: sprite,
      alpha: 1,
      scaleX: this.scene.game.scaleFactor * 0.25,
      scaleY: this.scene.game.scaleFactor * 0.25,
      ease: 'Bounce.easeOut',
      delay: index * 300,
      duration: 750,
      onComplete: () => {
        this.emitter.setPosition(this.sprite.x, this.sprite.y)
        this.emitter.setAlpha(0.1 + 0.2 * index)
        this.emitter.setQuantity(25 + 5 * index)
        this.emitter.active = true
        this.emitter.explode()
      },
    })
  }

  destroy() {
    this.destroyed = true
    this.sprite.alpha = 0
    this.coinSprite.alpha = 0
    this.textObject.alpha = 0
    this.redNodeSprite.alpha = 0
    this.blueNodeSprite.alpha = 0
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
      this.coinSprite.setScale(0.6 * this.scene.game.scaleFactor)
    } else if (score === 1) {
      this.coinSprite.setScale(0.3 * this.scene.game.scaleFactor)
    }
  }
}
