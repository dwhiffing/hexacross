import RuleMutator from './types/RuleMutator'

export default class DestroyIntersectionRuleMutator extends RuleMutator {
  apply({ linkService, hexService, activeTurnColor }) {
    linkService.getPairIntersections().forEach((intersection) => {
      const hex = hexService.getHexFromScreenPos(intersection.point)
      hex.hexObject.destroy(activeTurnColor)
    })
  }
}
