
/**
 * Production class.
 *
 * Used to represent the productions of a grammar.
 */
export default class Production {
  /**
   * Constructor.
   *
   * @param  {Array[String]} left  Left side of production.
   * @param  {Array[String]} right Right side of production.
   */
  constructor (left, right) {
    this.left = left
    this.right = right
  }

  /**
   * Converts the production to string.
   *
   * It converts in the format of 'left => right'
   *
   * @return {String} String representation of production.
   */
  toString () {
    const right = this.right.join(' ')
    return `${this.left} => ${right}`
  }

  /**
   * Checks if other is equal to this.
   *
   * It converts both to strings and compares the strings.
   *
   * @param  {Production} other Other production.
   *
   * @return {Boolean} True if equal, false otherwise.
   */
  equals (other) {
    return this.toString() === other.toString()
  }
}
