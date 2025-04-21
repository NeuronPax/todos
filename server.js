require('dotenv-flow').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const MODE = process.env.NODE_ENV
const PORT = process.env.PORT
const HOST = 'http://localhost'
const app = express()
let state = []

const createTodo = (id, label) => ({
  id,
  label,
  important: false,
  done: false
})

const createStore = (store, data) => {
  const getId = i => new Promise(r => {
    setTimeout(() => r(Date.now()), 100 * i)
  })
  data.forEach(async (label, i) => {
    const id = await getId(i)
    store.push(createTodo(id, label))
  })
}

const deleteTodo = id => {
  state = state.filter(el => el.id != id)
  return id
}

const editTodo = (id, action) => {
  let todo
  state = state.map(el => {
    if (el.id == id) {
      el = {...el, ...action}
      todo = el
    }
    return el
  })
  return todo
}

const addTodo = label => {
  const todo = createTodo(Date.now(), label)
  state.push(todo)
  return todo
}

createStore(state, ['Drink Coffee', 'Create Awesome App', 'Have a Lunch'])

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname)))

app.get('/api/tododata', (req, res) => {
  res.json(state)
})

app.delete('/api/tododata/:id', async (req, res) => {
  const data = await deleteTodo(req.params.id)
  res.json(data)
})

app.patch('/api/tododata/:id', async (req, res) => {
  const data = await editTodo(req.params.id, req.body)
  res.json(data)
})

app.post('/api/tododata', async (req, res) => {
  const data = await addTodo(req.body.label)
  res.json(data)
})

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`\nServer started:\n\n\tmode:\t${MODE}\n`)
      MODE === 'development' && console.log(`\tserver:\t${HOST}:${PORT}/api/tododata`)
      MODE === 'production' && console.log(`\tserver:\t${HOST}/api/tododata\n\n\tclient:\t${HOST}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()