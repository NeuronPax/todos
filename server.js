require('dotenv-flow').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const MODE = process.env.NODE_ENV
const PORT = process.env.PORT
const HOST = 'http://localhost'
const pathDB = path.resolve(__dirname, 'data', 'db.json')
const INITDEVSTORE = ['Drink Coffee', 'Create Awesome App', 'Have a Lunch']

let state = []

const createTodo = (label, i = 0) => ({
  id: Date.now() + (i * 100),
  label,
  important: false,
  done: false
})

const initStore = data => {
  let store = []
  data.forEach((label, i) => store.push(createTodo(label, i)))
  return store
}

const getData = () => JSON.parse(fs.readFileSync(pathDB, 'utf-8'))

const saveData = () => {
  const dir = path.dirname(pathDB)
  !fs.existsSync(dir) && fs.mkdirSync(dir)
  fs.writeFileSync(pathDB, JSON.stringify(state))
}

const addTodo = async label => {
  const todo = createTodo(label)
  state.push(todo)
  await saveData()
  return todo
}

const editTodo = async (id, action) => {
  let todo
  state = state.map(el => {
    if (el.id == id) {
      el = {...el, ...action}
      todo = el
    }
    return el
  })
  await saveData()
  return todo
}

const deleteTodo = async id => {
  state = state.filter(el => el.id != id)
  await saveData()
  return id
}

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname)))

app.get('/api/todo', async (req, res) => {
  res.json(state)
})

app.post('/api/todo', async (req, res) => {
  const data = await addTodo(req.body.label)
  res.json(data)
})

app.patch('/api/todo/:id', async (req, res) => {
  const data = await editTodo(req.params.id, req.body)
  res.json(data)
})

app.delete('/api/todo/:id', async (req, res) => {
  const data = await deleteTodo(req.params.id)
  res.json(data)
})

const start = () => {
  try {
    if (!fs.existsSync(pathDB)) {
      MODE === 'development' && (state = initStore(INITDEVSTORE))
      saveData()
    } else
      state = getData()
    app.listen(PORT, () => {
      console.log(`\nServer started:\n\n\tmode:\t${MODE}\n`)
      MODE === 'development' && console.log(`\tserver:\t${HOST}:${PORT}/api/todo`)
      MODE === 'production' && console.log(`\tserver:\t${HOST}/api/todo\n\n\tclient:\t${HOST}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()