import 'phaser'
import GameScalePlugin from 'phaser-plugin-game-scale'
import BootScene from './scenes/Boot'
import MenuScene from './scenes/Menu'
import GameScene from './scenes/Game'
import BlueVictoryScene from './scenes/BlueVictory'
import CreditsScene from './scenes/Credits'
import RedVictoryScene from './scenes/RedVictory'

const width = document.documentElement.clientWidth
const height = document.documentElement.clientHeight

const game = new Phaser.Game({
  transparent: true,
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width,
  height,
  scene: [BootScene, MenuScene, GameScene, BlueVictoryScene, RedVictoryScene, CreditsScene],
  scale: {
    width,
    height,
    resolution: window.devicePixelRatio,
  },
  plugins: {
    global: [
      {
        key: 'GameScalePlugin',
        plugin: GameScalePlugin,
        mapping: 'gameScale',
        data: {
          /* See 'Configuration' */
        },
      },
    ],
  },
})

export default game
