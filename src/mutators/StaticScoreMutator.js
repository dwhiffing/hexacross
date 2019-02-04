import sumBy from 'lodash/sumBy'
import ScoreMutator from './types/ScoreMutator'
import { RED, BLUE } from '../constants'

export default class StaticScoreMutator extends ScoreMutator {
  apply({ turnIndex, hexService, playerService }) {
    const link =
      turnIndex % 2 === 0 ? playerService.links[0] : playerService.links[1]

    const hexes = hexService.hexGrid
      .hexesBetween(link[0].hex, link[1].hex)
      .reverse()
    hexes.forEach((hex, index) => {
      hex.hexObject.capture(turnIndex % 2 === 0 ? RED : BLUE, index)
    })
    const redHexes = hexService.hexGrid.filter(
      hex => hex.hexObject.color === RED,
    )
    const blueHexes = hexService.hexGrid.filter(
      hex => hex.hexObject.color === BLUE,
    )
    const redScore = sumBy(redHexes, hex => hex.hexObject.score) * 10
    const blueScore = sumBy(blueHexes, hex => hex.hexObject.score) * 10

    return { redScore, blueScore }
  }
}
