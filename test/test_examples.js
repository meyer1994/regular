import { strict as assert } from 'assert'
import { readFileSync } from 'fs'

import HashSet from '../src/hashset'
import Automaton from '../src/automaton'
import Transition from '../src/transition'

// Default folder for examples
const folder = './test/examples'
function getAutomaton (fileName) {
  const file = readFileSync(`${folder}/${fileName}`)
  const json = JSON.parse(file)

  const states = new HashSet(json.states)
  const alphabet = new HashSet(json.alphabet)
  const transitions = new HashSet()
  for (const [ from, symbol, to ] of json.transitions) {
    for (const stateTo of to) {
      const trans = new Transition(from, symbol, stateTo)
      transitions.add(trans)
    }
  }
  const start = json.initial_state
  const finals = new HashSet(json.final_states)
  return new Automaton(states, alphabet, transitions, start, finals)
}

describe('Examples', function () {
  const tests = [
    {
      file: 'aa.json',
      inputs: [ 'aa' ]
    },
    {
      file: 'aaORbb.json',
      inputs: [ 'aa', 'bb', 'abba' ]
    },
    {
      file: 'bad_case.json',
      inputs: [ 'baaa', 'aaabaaa', 'bbbb', 'bbbbbbbbbbbbb' ]
    },
    {
      file: 'bb.json',
      inputs: [ 'bb', '' ]
    },
    {
      file: 'bdiv3.json',
      inputs: [ '', 'bbb', 'bbbbbbbbbbbb' ]
    },
    {
      file: 'div3.json',
      inputs: [ 0, 3, 6, 333 ].map(i => Number(i).toString(2))
    },
    {
      file: 'div5.json',
      inputs: [ 0, 5, 10, 1000000000 ].map(i => Number(i).toString(2))
    },
    {
      file: 'endsWbb.json',
      inputs: [ 'abb', 'ababababaabb', 'bbbbbbbbbb', 'bb' ]
    },
    {
      file: 'one1.json',
      inputs: [ '1' ]
    }
  ]

  tests.forEach(function (test) {
    const { file, inputs } = test
    const automaton = getAutomaton(file)

    inputs.forEach(function (input) {
      it(`Automaton ${file} should accept '${input}'`, function () {
        const result = automaton.match(input.split(''))
        assert(result)
      })
    })
  })

  it('Should check if automaton does not accept anything', function () {
    const automaton = getAutomaton('empty.json')
    const result = automaton.empty()
    assert(result)
  })
})
