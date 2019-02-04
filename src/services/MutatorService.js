import DestroyIntersectionRuleMutator from '../mutators/DestroyIntersectionRuleMutator'
import StaticScoreMutator from '../mutators/StaticScoreMutator'

export default class MutatorService {
  constructor() {
    this.destroyIntersection = new DestroyIntersectionRuleMutator()
    this.staticScore = new StaticScoreMutator()
  }

  applyMutators(data) {
    this.destroyIntersection.apply(data)
    this.staticScore.apply(data)
  }
}
