
Vue.component('nfa-input-controls', {
  props: [ 'automata' ],
  data: function () {
    return {
      symbol: '',
      state: '',
      name: ''
    }
  },
  computed: {
    deterministic: function () {
      return this.automata.isDeterministic()
    }
  },
  methods: {
    addSymbol: function () {
      const symbol = this.symbol
      if (symbol.match(/^[a-z\d]$/)) {
        this.automata.addSymbol(symbol)
        this.symbol = ''
        return
      }

      if (symbol === '') {
        return
      }

      window.alert('Invalid symbol')
    },
    addState: function () {
      const state = this.state
      if (!state.match(/^[a-z\d]$/)) {
        this.automata.addState(state, {})
        this.state = ''
        return
      }

      if (state === '') {
        return
      }

      window.alert('Invalid state name')
    }
  },
  template: `
  <card>
    <grid>
      <template>
        <div col="1/3">
          <label><b tt="Press enter to submit"> Symbol </b></label>
          <input
            @change="addSymbol()"
            type="text"
            placeholder="New symbol"
            minlength="1"
            maxlength="1"
            size="6"
            v-model="symbol">
        </div>

        <div col="1/3">
          <label><b tt="Press enter to submit"> State </b></label>
          <input
            @change="addState()"
            type="text"
            placeholder="New state"
            minlength="1"
            maxlength="8"
            size="5"
            v-model="state">
        </div>

        <div col="1/3">
          <button @click="automata.beautify()"> Beau </button>
          <button v-if="deterministic" disabled> Det </button>
          <button v-else @click="automata.determinize()"> Det </button>
          <button @click="automata.minimize()"> Mini </button>
        </div>
      </template>
    </grid>
  </card>
  `
})

Vue.component('nfa-input', {
  props: [ 'automata' ],
  data: function () {
    return {
      headers: [ 'Start', 'Accept', 'Label' ]
    }
  },
  computed: {
    alphabet: function () {
      return this.automata.alphabet
    },
    start: {
      get: function () {
        return this.automata.start
      },
      set: function (start) {
        console.log('Changing start:', start)
        this.automata.start = start
      }
    },
    accept: {
      get: function () {
        return this.automata.accept
      },
      set: function (accept) {
        console.log('Changing accept:', accept)
        this.automata.accept = accept
      }
    },
    table: function () {
      return this.automata.table
    }
  },
  methods: {
    updateTransition: function (state, symbol, event) {
      const input = event.target.value.replace(/\s/gi, '').split(',').sort()
      if (input.some(i => i.match(/^[a-z\d]$/))) {
        window.alert('Invalid transitions')
        return
      }

      const states = this.states
      if (input.some(i => !states.includes(i))) {
        window.alert('One transition foes to a non-existent state')
        return
      }

      console.log('Updating transiton:', state, symbol, input)
      this.automata.table[state][symbol] = input
    }
  },
  template: `
  <div>
    <nfa-input-controls :automata="automata"></nfa-input-controls>
    <template>
      <table>

        <thead>
          <tr align="center">
            <th v-for="header of headers"> {{ header }} </th>

            <th
              v-for="symbol of alphabet"
              @click="automata.removeSymbol(symbol)">
              {{ symbol }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr align="center" v-for="state of automata.states">
            <td>
              <input
                type="radio"
                :value="state"
                v-model="start">
              <label></label>
            </td>

            <td>
              <input
                type="checkbox"
                :value="state"
                v-model="accept">
              <label></label>
            </td>

            <td @click="automata.removeState(state)">
              <b tt="Click to remove"> {{ state }} </b>
            </td>

            <td v-for="symbol of alphabet">
              <input
                type="text"
                size="1"
                placeholder="states"
                :value="table[state][symbol]"
                @change="updateTransition(state, symbol, $event)">
            </td>
          </tr>
        </tbody>

      </table>
    </template>
  </div>
  `
})

Vue.component('grammar-input', {
  data: function () {
    return {
      input: '',
      selected: ''
    }
  },
  computed: {
    saves: () => store.state.saves,
    isValid: {
      get: function () {
        const grammarRE = /^[A-Z]'?->[a-z\d&][A-Z]?(\|[a-z\d&][A-Z]?)*$/
        const input = this.input.split('\n').map(i => i.replace(/\s/gi, ''))
        for (const line of input) {
          if (!line.match(grammarRE)) {
            return false
          }
        }
        return true
      }
    }
  },
  methods: {
    load: function () {
      const input = this.input.replace(/\s/gi, '')

      // Create grammar from text
      const start = input[0]
      const productions = {}
      for (const line of input.split('\n')) {
        const nonTerminal = line[0]
        const prods = line.split('->')[1].split('|')
        productions[nonTerminal] = prods
        console.log(productions)
      }

      const grammar = new Grammar(start, productions)
      const nfa = NFA.fromGrammar(grammar)

      store.commit('addSave', {
        text: input.split('\n')[0],
        value: nfa
      })
      store.commit('updateAutomata', nfa)
    },
    select: function () {
      const grammar = Grammar.fromNFA(this.selected)

      // Convert to text
      const lines = []
      const productions = Object.assign({}, grammar.productions)

      // Convert all productions to text
      const entries = Object.entries(productions)
      for (const [nonTerminal, productions] of entries) {
        const text = `${nonTerminal} -> ${productions.join(' | ')}`
        if (nonTerminal === grammar.first) {
          lines.unshift(text)
        } else {
          lines.push(text)
        }
      }
      this.input = lines.join('\n')
    }
  },
  template: `
  <card>
    <h5> Grammar </h5>
    <hr>
    <template>
      <textarea
        rows="1"
        style="resize: none;"
        placeholder="S -> aS | a"
        v-model="input">
      </textarea>

      <button v-if="isValid" @click="load()"> Load grammar </button>
      <button v-else disabled> Load grammar </button>

      <select v-model="selected" @change="select()">
        <option disabled :value="''"> Languages </option>
        <option v-for="save of saves"
          :value="save.value">
          {{ save.text }}
        </option>
      </select>
    </template>
  </card>
  `
})

Vue.component('regex-input', {
  data: function () {
    return {
      input: ''
    }
  },
  methods: {
    load: function () {
      if (!this.isValid()) {
        window.alert('Invalid regex')
        return
      }

      const regex = new RE(this.input.replace(/\s/gi, ''))
      const dfa = regex.toDFA()
      const obj = {
        text: this.input,
        value: dfa
      }
      store.commit('addSave', obj)
      store.commit('updateAutomata', dfa)
    },
    isValid: function () {
      const regexRE = /^[a-z\d*?()|]*$/
      const input = this.input.replace(/\s/gi, '')

      if (!input.match(regexRE)) {
        return false
      }

      try {
        const re = new RegExp(input)
        return true
      } catch (e) {
        return false
      }
    }
  },
  template: `
  <card>
    <h5> Regex </h5>
    <hr>
    <template>
      <textarea
        rows="1"
        style="resize: none;"
        placeholder="aa*"
        v-model="input">
      </textarea>
      <button @click="load()"> Load regex </button>
    </template>
  </card>
  `
})

Vue.component('match-input', {
  data: function () {
    return {
      input: ''
    }
  },
  computed: {
    match: function () {
      const result = store.state.automata.match(this.input)
      if (result) {
        return true
      }
      return false
    }
  },
  template: `
  <card>
    <h5> Match </h5>
    <hr>
    <label> Input </label>
    <input
      v-model="input"
      placeholder="input"
      type="text">
    </input>
    <p v-if="match"><strong> Match </strong></p>
    <p v-else> No match </p>
  </card>
  `
})

Vue.component('enumerate-input', {
  data: function () {
    return {
      input: ''
    }
  },
  computed: {
    result: {
      get: function () {
        const input = this.input.replace(/\s/gi, '')
        if (!input.match(/\d\d?/)) {
          return
        }

        const int = parseInt(this.input)
        return store.state.automata.enumerate(int)
      }
    }
  },
  template: `
  <card>
    <h5> Enumerate </h5>
    <hr>
    <label> Input </label>
    <input
      v-model="input"
      placeholder="input"
      type="text">
    </input>
    <p> {{ result }} </p>
  </card>
  `
})

Vue.component('operations-input', {
  data: function () {
    return {
      first: null,
      second: null,
      operation: '',
      operations: [ 'union', 'intersection', 'complement', 'reverse' ],
      steps: [],
      name: ''
    }
  },
  computed: {
    saves: () => store.state.saves
  },
  methods: {
    operate: function () {
      const first = this.first
      const second = this.second
      const op = this.operation

      // Clear old steps
      this.steps = []

      switch (this.operation) {
        case ('union'):
          this.steps.push(NFA.union(first, second))
          return
        case ('intersection'):
          const compFirst = NFA.complement(first)
          const compSecond = NFA.complement(second)
          const union = NFA.union(compFirst, compSecond)
          this.steps = [
            { text: 'First complement', value: compFirst },
            { text: 'Second complement', value: compSecond },
            { text: 'Union of complements', value: union },
            { text: 'Complement of union', value: NFA.complement(union) }
          ]
          return
      }
    },
    save: function (nfa) {
      const name = this.name
      if (name === '') {
        return
      }

      store.commit('addSave', {
        text: name,
        value: nfa
      })
      this.name = ''
    }
  },
  template: `
  <div>
    <template>
    <card>
      <span v-for="op of operations">
        <input @change="operate()" type="radio" :value="op" v-model="operation">
        <label> {{ op }} </label>
      </span>

      <label> First operand </label>
      <select v-model="first">
        <option disabled value=""> First operand </option>
        <option v-for="save of saves"
          :value="save.value">
          {{ save.text }}
        </option>
      </select>

      <label> Second operand </label>
      <select v-model="second">
        <option disabled value=""> Second operand </option>
        <option v-for="save of saves"
          :value="save.value">
          {{ save.text }}
        </option>
      </select>
    </card>

      <hr></hr>

      <template v-for="step of steps">
        <card>
          <h2> {{ step.text }} </h2>
          <label><b tt="Press enter to save"> Save </b></label>
          <input
            type="text"
            v-model="name"
            placeholder="name"
            @change="save(step.value)"></input>
          <nfa-input :automata="step.value"></nfa-input>
        </card>
      </template>


    </template>
  </div>
  `
})

Vue.component('saves-input', {
  data: function () {
    return {
      selected: '',
      name: ''
    }
  },
  computed: {
    saves: () => store.state.saves
  },
  methods: {
    load: function () {
      store.commit('updateAutomata', this.selected)
    },
    newLang: function () {
      store.commit('addSave', {
        text: this.name,
        value: new NFA('', [], {})
      })
      this.name = ''
    }
  },
  template: `
  <div>
    <template>

      <label> Saved </label>
      <select v-model="selected" @change="load()">
        <option disabled value=""> Select automata </option>
        <option v-for="save of saves"
          :value="save.value"> {{ save.text }} </option>
      </select>

      <label><b tt="Press enter to save"> Name </b></label>
      <input
        type="text"
        placeholder="Name"
        @change="newLang()"
        v-model="name">

    </template>
  </div>
  `
})
