
export default class HashSet {
  constructor (iterable = []) {
    this._values = {}
    iterable.forEach(i => this.add(i))
  }

  add (item) {
    this._values[item] = item
    return this
  }

  has (item) {
    return item in this._values
  }

  get size () {
    return Object.keys(this._values).length
  }

  get length () {
    return 0
  }

  clear () {
    this._values = {}
  }

  delete (item) {
    const has = this.has(item)
    delete this._values[item]
    return has
  }

  values () {
    return Object.values(this._values)
  }

  entries () {
    return Object.entries(this._values)
  }

  forEach (fn) {
    this.values().forEach(i => fn(i))
  }
}
