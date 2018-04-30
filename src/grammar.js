
class Grammar {
  /**
   * Constructor.
   *
   * The object passed must obey the following criteria:
   * - Keys are the production symbols, uppercase;
   * - Values are the productions, 1 or 2 characters, the second one must be
   *   uppercase and must be of one of the key values.
   *
   * Example:
   * Grammar, which produces odd number of 'a':
   * S -> aA | a
   * A -> aS
   *
   * Object representation:
   * {
   *   'S': ['aA', 'a'],
   *   'A': ['aS']
   * }
   *
   * @param  {Object} obj [description]
   */
  constructor (obj) {
    throw new Error('TODO')
  }

  /**
   * Converts this regular grammar into a deterministic finite automata
   *
   * @return {DFA} This regular grammar, converted to an automata.
   */
  toDFA () {
    throw new Error('TODO')
  }

  /**
   * Gets the regular grammar that represents the union of rga and rgb.
   *
   * @param  {Grammar} rga Regular grammar A.
   * @param  {Grammar} rgb Regular grammar B.
   *
   * @return {Grammar}     Regular grammar that is A union B.
   */
  static union (rga, rgb) {
    throw new Error('TODO')
  }

  /**
   * Gets the regular grammar that represents the concatenation of rga and rgb.
   *
   * @param  {Grammar} rga Regular grammar A.
   * @param  {Grammar} rgb Regular grammar B.
   *
   * @return {Grammar}     Regular grammar that is A concat B.
   */
  static concat (rga, rgb) {
    throw new Error('TODO')
  }

  /**
   * Gets the closure representation of the grammar.
   *
   * @param  {Grammar} rga A grammar.
   * @return {Grammar}     Closure of grammar A.
   */
  static closure (rga) {
    throw new Error('TODO')
  }

  static intersection (rga, rgb) {
    throw new Error('TODO')
  }

  static diff (rga, rgb) {
    throw new Error('TODO')
  }

  static reverse (rga, rgb) {
    throw new Error('TODO')
  }
}

module.exports = Grammar
