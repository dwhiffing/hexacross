import DestroyIntersectionRuleMutator from '../mutators/DestroyIntersectionRuleMutator'
import StaticScoreMutator from '../mutators/StaticScoreMutator'
import TurnLimitWinConditionMutator from '../mutators/TurnLimitWinConditionMutator'

export default class MutatorService {
  constructor(scene) {
    this.destroyIntersection = new DestroyIntersectionRuleMutator()
    this.turnLimitWinCondition = new TurnLimitWinConditionMutator()
    this.staticScore = new StaticScoreMutator()
    this.sceneRef = scene
  }

  applyMutators(data) {
    this.destroyIntersection.apply(data)
    const { redScore, blueScore } = this.staticScore.apply(data)
    data.interfaceService.updatePlayerScores(redScore, blueScore)
    const winnerIndex = this.turnLimitWinCondition.apply(
      Object.assign({}, data, { redScore, blueScore }),
    )
    if (winnerIndex != null) {
      this.sceneRef.scene.start('GameOver', { winnerIndex })
    }
  }
}
