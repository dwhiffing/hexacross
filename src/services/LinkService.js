import compact from 'lodash/compact'
import Piece from '../sprites/piece'

export default class LinkService {
  constructor(scene, pairs) {
    this.game = scene.game
    this.scene = scene
    this.links = []

    pairs.forEach((pair) => {
      pair = pair.map((hex) => {
        const piece = new Piece(scene, hex.hexObject)
        piece.hex = hex
        hex.piece = piece
        piece.sprite.setFrame(11)
        if (hex.index === 0) {
          piece.disable()
        }
        return piece
      })
      pair.color = pair[0].hex.color
      pair[0].link = pair[1]
      pair[1].link = pair[0]
      this.links.push(pair)
    })

    this.drawLinks(this.links)
  }

  drawLink(pair) {
    if (pair.graphics) {
      pair.graphics.clear()
    }
    pair.graphics = this.scene.add.graphics({ lineStyle: { width: 12, color: pair.color } })
    const line = new Phaser.Geom.Line(
      pair[0].hex.hexObject.sprite.x,
      pair[0].hex.hexObject.sprite.y,
      pair[1].hex.hexObject.sprite.x,
      pair[1].hex.hexObject.sprite.y,
    )
    pair[0].line = line
    pair[1].line = line
    pair.graphics.strokeLineShape(line)
  }

  drawLinks() {
    this.links.forEach(this.drawLink.bind(this))
  }

  getPairIntersections() {
    return compact([
      this.getPairIntersection(this.links[0], this.links[2]),
      this.getPairIntersection(this.links[1], this.links[2]),
    ])
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
}
