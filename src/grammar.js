
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
   * @param  {Object} obj Object representing the regular grammar.
   */
  constructor (first, obj) {
    this.checkFormat(first, obj)
  }

  checkFormat (first, obj) {
    const left = new Set(Object.keys(obj))

    // String
    if (typeof first !== 'string') {
      throw new Error('first should be a string')
    }

    // Object
    // copied from here, added De Morgan law to logic expression:
    // https://stackoverflow.com/a/16608074/5092038
    if ((!obj) || (obj.constructor !== Object)) {
      throw new Error('obj should be an object ({})')
    }

    // Single uppercase letter
    if (first.match(/^[A-Z]$/) === null) {
      throw new Error('first should be a single uppercase letter')
    }

    // On left side
    if (!left.has(first)) {
      throw new Error('first should appear in left side')
    }

    // Left side
    for (let item of left) {
      // Length
      if (item.length !== 1) {
        throw new Error('length of left side should always be 1')
      }

      // Uppercase
      if (item.match(/^[A-Z]$/) === null) {
        throw new Error('left side should be a single uppercase letter')
      }
    }

    // Right side
    // First pdocution
    // Recursive and has epslon
    if (this.epslonRecursive(first, obj[first])) {
      throw new Error('first production should not have epslon if recursive')
    }
  }

  epslonRecursive (left, right) {
    return this.isRecursive(left, right) && right.indexOf('&') !== -1
  }

  isRecursive (left, right) {
    for (let item of right) {
      if (item.length === 2 && item[1] === left) {
        return true
      }
    }
    return false
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

  isRegular () {
    
  }
}

module.exports = Grammar
