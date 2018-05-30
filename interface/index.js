Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    automata: new NFA('', [], {}),
    saves: [
      {
        text: '(aaa)*',
        value: new NFA('A', [ 'A' ], {
          A: { a: [ 'B' ] },
          B: { a: [ 'C' ] },
          C: { a: [ 'A' ] }
        })
      },
      {
        text: '(aa)*',
        value: new NFA('A', [ 'A' ], {
          A: { a: [ 'B' ] },
          B: { a: [ 'A' ] }
        })
      }
    ]
  },
  mutations: {
    updateAutomata: function (state, payload) {
      console.log('Update automata called:', payload)
      state.automata = payload
    },
    addSave: function (state, payload) {
      console.log('Add save called:', payload)
      state.saves.push(payload)
    }
  }
})

const app = new Vue({
  el: '#app',
  store: store,
  data: {

    automata: new NFA('', [], {})
  }
})
