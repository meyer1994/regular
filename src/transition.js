
/**
 * Class that represents the automaton transition.
 */
export default class Transition {
  /**
   * Creates the transition.
   *
   * @param  {String} from   Origin transition.
   * @param  {String} symbol Symbol of transition.
   * @param  {String} to     Destination of transition.
   */
  constructor (from, symbol, to) {
    this.from = from
    this.symbol = symbol
    this.to = to
  }

  /**
   * Returns string represenation of the class.
   *
   * @return {String} Returns string in the form: '(from, symbol) => to'
   */
  toString () {
    return `(${this.from}, ${this.symbol}) => ${this.to}`
  }

  /**
   * Checks if the transitions are equal.
   *
   * @param  {Transition} transition Transition to test with this.
   *
   * @return {boolean} True if all the parameters match, false otherwise.
   */
  equals (transition) {
    const from = this.from === transition.from
    const symbol = this.symbol === transition.symbol
    const to = this.to === transition.to
    return from && symbol && to
  }
}
