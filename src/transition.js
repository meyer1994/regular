
export default class Transition {
  constructor (from, symbol, to) {
    this.from = from
    this.symbol = symbol
    this.to = to
  }

  toString () {
    return `(${this.from}, ${this.symbol}) => ${this.to}`
  }
}
