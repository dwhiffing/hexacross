import compact from 'lodash/compact'
import Piece from '../sprites/piece'
import { RED } from '../constants'

export default class LinkService {
  constructor(scene, pairs) {
    this.game = scene.game
    this.scene = scene
    this.links = []

    pairs.forEach(pair => {
      const particles = this.scene.add.particles(
        pair[0].color === RED ? 'particle-pink' : 'particle-green',
      )
      pair = pair.map(hex => {
        const piece = new Piece(scene, hex.hexObject, hex.color)
        piece.hex = hex
        hex.piece = piece
        return piece
      })
      pair.particles = particles
      pair.color = pair[0].hex.color
      pair[0].link = pair[1]
      pair[1].link = pair[0]
      this.links.push(pair)
    })

    this.drawLinks(this.links)

    this.links.forEach(pair => {
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
        alpha: 0.25,
        blendMode: 'SCREEN',
        emitZone: { type: 'random', source: curve, quantity: 200 },
      })
    })

    this.links[0].emitter.setAlpha(1)

    this.resize = this.resize.bind(this)
  }

  drawLink(pair) {
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

  drawLinks() {
    this.links.forEach(this.drawLink.bind(this))
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

  resize(scaleFactor) {
    this.links.forEach(link =>
      link.forEach(piece => piece.sprite.setScale(scaleFactor * 0.2)),
    )
  }
}
