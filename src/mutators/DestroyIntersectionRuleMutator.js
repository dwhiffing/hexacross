import RuleMutator from './types/RuleMutator'

export default class DestroyIntersectionRuleMutator extends RuleMutator {
  apply({ playerService, hexService }) {
    playerService.getPairIntersections().forEach(intersection => {
      const hex = hexService.getHexFromScreenPos(intersection.point)
      hex.hexObject.destroy()
    })
  }
}
