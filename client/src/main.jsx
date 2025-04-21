import {createRoot} from 'react-dom/client'
import {createContext, useContext, useState, useEffect} from 'react'
import axios from 'axios'

import 'font-awesome/css/font-awesome.css'
import './index.css'

const DataContext = createContext()

const useData = () => useContext(DataContext)

const $api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL
})

const DataProvider = ({children}) => {
  const [todoData, setTodoData] = useState([])
  
  const getTodo = async () => {
    const {data} = await $api.get('/api/tododata')
    setTodoData(data)
  }
  
  const deleteTodo = async id => {
    await $api.delete(`/api/tododata/${id}`)
    setTodoData(todoData.filter(el => el.id !== id))
  }
  
  const editTodo = async (id, action) => {
    const {data} = await $api.patch(`/api/tododata/${id}`, action)
    setTodoData(todoData.map(el => el.id === id ? el = data : el))
  }
  
  const addTodo = async label => {
    const {data} = await $api.post('/api/tododata', {label})
    setTodoData([...todoData, data])
  }
  
  useEffect(() => {
    getTodo()
  }, [])
  
  return (
    <DataContext.Provider value={{todoData, deleteTodo, editTodo, addTodo}}>
      {children}
    </DataContext.Provider>
  )
}

const TodoListItem = ({label, important, done, onDeleteItem, onEditItem}) => (
  <span className='flex items-center'>
    <span
      className={`flex-1 ml-5 select-none cursor-pointer ${important && 'text-blue-400 font-bold'} ${done && 'line-through'}`}
      onClick={() => onEditItem({done: !done})}>
        {label}
    </span>
    <button
      className='border border-green-600 rounded text-xs text-green-600 w-8 h-7 m-1 hover:bg-green-600 hover:text-white transition'
      onClick={() => onEditItem({important: !important})}>
        <i className='fa fa-exclamation' />
    </button>
    <button
      className='border border-red-600 rounded text-xs text-red-600 w-8 h-7 m-1 hover:bg-red-600 hover:text-white transition'
      onClick={onDeleteItem}>
        <i className='fa fa-trash' />
    </button>
  </span>
)

const TodoList = () => {
  const {todoData, deleteTodo, editTodo} = useData()
  return (
    <ul className='border border-gray-300 rounded-md divide-y divide-gray-300 bg-gray-100 text-xl'>
      {todoData.map(({id, ...items}) => (
        <li key={id} className='py-1 px-3'>
          <TodoListItem
            {...items}
            onDeleteItem={() => deleteTodo(id)}
            onEditItem={action => editTodo(id, action)} />
        </li>
      ))}
    </ul>
  )
}

const TodoAddItem = () => {
  const {addTodo} = useData()
  const [value, setValue] = useState('')
  
  const onFormSubmit = e => {
    e.preventDefault()
    value.trim() && addTodo(value.trim())
    setValue('')
  }
  
  return (
    <form
      className='flex mt-2'
      onSubmit={onFormSubmit}>
        <input
          className='flex-1 border border-gray-300 rounded-md bg-gray-100 focus:bg-white outline-none focus:ring-4 ring-blue-300 mr-1 py-2 px-3 transtition'
          placeholder='What needs to be done'
          value={value}
          onChange={e => setValue(e.target.value)} />
        <button className='border border-gray-400 rounded-md px-3 hover:bg-gray-400 hover:text-white transition'>Add</button>
    </form>
  )
}

const App = () => {
  return (
    <div className='max-w-md my-4 mx-auto'>
      <TodoList />
      <TodoAddItem />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <DataProvider>
    <App />
  </DataProvider>
)