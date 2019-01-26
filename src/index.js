import 'phaser'
import BootScene from './scenes/Boot'
import MenuScene from './scenes/Menu'
import GameScene from './scenes/Game'

const width = 800
const height = 600

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width,
  height,
  scene: [BootScene, MenuScene, GameScene],
})

export default game
