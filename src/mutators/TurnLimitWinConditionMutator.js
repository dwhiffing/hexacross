import RuleMutator from './types/RuleMutator'

export default class TurnLimitWinConditionMutator extends RuleMutator {
  apply({ turnIndex, redScore, blueScore }) {
    if (turnIndex > 0) {
      return null
    }

    let winnerIndex = blueScore > redScore ? 1 : 0
    if (blueScore === redScore) {
      winnerIndex = -1
    }
    return winnerIndex
  }
}
