import { RED, BLUE } from '../constants'
import Link from '../sprites/link'
import compact from 'lodash/compact'

const STARTING_COORDS = [
  [{ x: 3, y: 0, color: RED }, { x: 5, y: 0, color: RED }],
  [{ x: 3, y: 8, color: BLUE }, { x: 5, y: 8, color: BLUE }],
]

export default class PlayerService {
  constructor(scene) {
    this.scene = scene
    this.hexService = scene.hexService
    this.resize = this.resize.bind(this)

    this.initLinks()
    this.initEmitters()
  }

  initLinks() {
    this.links = []

    STARTING_COORDS.map(coordPair =>
      coordPair.map((coord, index) => {
        const hex = this.hexService.hexGrid.get(coord)
        hex.index = index
        hex.color = coord.color
        return hex
      }),
    ).forEach(pair => {
      const particles = this.scene.add.particles(
        pair[0].color === RED ? 'particle-pink' : 'particle-green',
      )
      pair = pair.map(hex => {
        const link = new Link(this.scene, hex.hexObject, hex.color)
        link.hex = hex
        hex.link = link
        return link
      })
      pair.particles = particles
      pair.color = pair[0].hex.color
      pair[0].link = pair[1]
      pair[1].link = pair[0]
      this.links.push(pair)
    })

    this.updateLinks()
  }

  initEmitters() {
    this.links.forEach((pair, index) => {
      const { x: startX, y: startY } = pair[0].hex.hexObject.sprite
      const { x: endX, y: endY } = pair[1].hex.hexObject.sprite

      const curve = new Phaser.Curves.Spline([
        startX,
        startY + 200,
        endX,
        endY + 200,
      ])
      pair.emitter = pair.particles.createEmitter({
        y: -200,
        scale: { start: 0.3, end: 0 },
        alpha: index === 0 ? 1 : 0.25,
        blendMode: 'SCREEN',
        emitZone: { type: 'random', source: curve, quantity: 200 },
      })
    })
  }

  updateLink(pair) {
    pair[0].pair = pair
    pair[1].pair = pair

    const line = new Phaser.Geom.Line(
      pair[0].hex.hexObject.sprite.x,
      pair[0].hex.hexObject.sprite.y,
      pair[1].hex.hexObject.sprite.x,
      pair[1].hex.hexObject.sprite.y,
    )
    pair[0].line = line
    pair[1].line = line
  }

  updateLinks() {
    this.links.forEach(this.updateLink.bind(this))
  }

  getPairIntersections() {
    return compact([this.getPairIntersection(this.links[0], this.links[1])])
  }

  getPairIntersection(pairA, pairB) {
    const lineA = pairA[0].line
    const lineB = pairB[0].line
    const point = new Phaser.Geom.Point()
    Phaser.Geom.Intersects.LineToLine(lineA, lineB, point)
    if (point.x === 0 && point.y === 0) {
      return
    }

    return { point, color: pairA.color }
  }

  setTurn(turnIndex) {
    this.links[0].emitter.setAlpha(turnIndex % 2 === 0 ? 1 : 0.25)
    this.links[1].emitter.setAlpha(turnIndex % 2 === 0 ? 0.25 : 1)
    this.updateLinks()
  }

  resize(scaleFactor) {
    this.links.forEach(link =>
      link.forEach(link => link.sprite.setScale(scaleFactor * 0.2)),
    )
  }
}
