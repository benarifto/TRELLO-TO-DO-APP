import Home from '../views/Home.vue'
import AddTodo from '../views/AddTodo.vue'
import TodoList from '../views/TodoList.vue'
import EditTodo from '../views/EditTodo.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/add-todo',
    name: 'AddTodo',
    component: AddTodo
  },
  {
    path: '/todo-list',
    name: 'TodoList',
    component: TodoList
  },
  {
    path: '/edit-todo/:id',
    name: 'edit-todo',
    component: EditTodo
  }
]

export default routes
