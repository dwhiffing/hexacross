export default class extends Phaser.Scene {
  constructor() {
    super({
      key: 'Menu',
    })
  }

  create() {
    this.background = this.add.sprite(350, 300, 'title').setInteractive()

    this.background.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
