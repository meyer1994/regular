
const VALID_INPUT = /^[\s/|/?/*/.A-Z0-9/(/)]*$/ig
const ALPHABET = /[A-Z0-9]/i
const WHITE_SPACE = /\s/gi

class Parser {
  constructor (input) {
    if (input.match(VALID_INPUT) === null) {
      throw new Error(`Invalid regex passed to constructor => ${input}`)
    }

    this.input = input
      .replace('.', '') // remove dots
      .replace(WHITE_SPACE, '') // remove spaces
    this.index = 0
  }

  /**
   * Gets the next symbol from the input.
   *
   * @return {String} The next symbol of the input, empty string if there isn't
   *                  any.
   */
  peek () {
    if (this.index > this.input.length) {
      return ''
    }
    return this.input[this.index]
  }

  /**
   * Consumes the current char of the input.
   *
   * Throws an error if the passed char is different than the current one.
   *
   * @param  {String} char Char to be consumend.
   */
  eat (char) {
    let peek = this.peek()
    if (peek === char) {
      this.index++
      return
    }
    throw new Error(`Invalid regex, it was expected '${char}', but got '${peek}' instead`)
  }

  /**
   * Gets the next char and consumes it.
   *
   * Very similar to the way a pop() works in an stack.
   *
   * @return {String} Next symbol to be threated.
   */
  next () {
    const symbol = this.peek()
    this.eat(symbol)
    return symbol
  }

  /**
   * Checks if there is more symbols to see.
   *
   * @return {Boolean} True if there are symbols, false otherwise.
   */
  more () {
    return this.input.length > this.index
  }

  /**
   * Parses the regular expression.
   *
   * @return {Node} Root node of the operations tree of the RegEx.
   */
  regex () {
    const term = this.term()

    if (this.more() && this.peek() === '|') {
      this.eat('|')
      const regex = this.regex()
      return { value: '|', left: term, right: regex }
    }

    return term
  }

  /**
   * Returns an subexpression.
   *
   * A subexpression is composed only by the following operations:
   * - Concatenation;
   * - Closure;
   * - Final symbols (the alphabet in this implementation).
   *
   * @return {Node} Root node of some branch representing the subexpression.
   */
  term () {
    let factor = this.factor()
    while (this.more() && this.peek() !== ')' && this.peek() !== '|') {
      let next = this.term()
      factor = { value: '.', left: factor, right: next }
    }
    return factor
  }

  /**
   * Gets all the possible number of closures concatenated.
   *
   * Note:
   * Closure operators are cumulative. It does not make much sense. But it is
   * valid RegEx to use (ab)** (which is the same as (ab)*).
   *
   * @return {Node} Root node of the branch of all the closure operations.
   */
  factor () {
    let base = this.base()
    let peek = this.peek()
    while (this.more() && (peek === '*' || peek === '?')) {
      this.eat(peek)
      base = { value: peek, left: base, right: null }
      peek = this.peek()
    }
    return base
  }

  /**
   * Gets the leaf of some branch.
   *
   * Gets the leaf of the branch in this parse tree. In this implementation,
   * all the leafs in a tree are only alphabet symbols and digits.
   *
   * @return {Node} Leaf node. A node without children and a letter, or digit,
   *                as its value.
   */
  base () {
    let char = this.peek()
    if (char.match(ALPHABET)) {
      const leaf = this.next()
      return { value: leaf, left: null, right: null }
    }

    if (char === '(') {
      this.eat(char)
      const regex = this.regex()
      this.eat(')')
      return regex
    }

    throw new Error(`Invalid character at leaf node. Expected alpha-numeric symbol, got '${char} instead' `)
  }
}

module.exports = Parser
