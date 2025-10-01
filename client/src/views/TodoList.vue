<template>
  <div class="todo-list">
    <div class="page-header">
      <h1>{{ $t('todoList.title') }}</h1>
      <p>{{ $t('todoList.description') }}</p>
    </div>
    
    <!-- Filters and Controls -->
    <div class="controls-section">
      <div class="filters">
        <div class="filter-group">
          <label>{{ $t('todoList.filterByStatus') }}</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">{{ $t('todoList.allStatuses') }}</option>
            <option value="Aktif">{{ $t('todoList.pending') }}</option>
            <option value="Tamamlandı">{{ $t('todoList.completed') }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>{{ $t('todoList.filterByCategory') }}</label>
          <select v-model="categoryFilter" class="filter-select">
            <option value="">{{ $t('todoList.allCategories') }}</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ currentLocale === 'tr' ? category.name_tr : category.name_en }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>{{ $t('todoList.sortBy') }}</label>
          <select v-model="sortBy" class="filter-select">
            <option value="created_at">{{ $t('todoList.dateCreated') }}</option>
            <option value="priority">{{ $t('todoList.priority') }}</option>
            <option value="title">{{ $t('todoList.title') }}</option>
            <option value="due_date">{{ $t('todoList.dueDate') }}</option>
          </select>
        </div>
      </div>
      
      <div class="actions">
        <router-link to="/add-todo" class="btn btn-primary">
          {{ $t('todoList.addNewTodo') }}
        </router-link>
      </div>
    </div>
    
    <!-- Todo List -->
    <div class="todos-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ $t('todoList.loading') }}</p>
      </div>
      
      <div v-else-if="filteredTodos.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>{{ $t('todoList.noTodos') }}</h3>
        <p>{{ $t('todoList.noTodosDescription') }}</p>
        <router-link to="/add-todo" class="btn btn-primary">
          {{ $t('todoList.createFirstTodo') }}
        </router-link>
      </div>
      
             <div v-else class="todos-grid">
         <!-- Todo Items -->
         <TodoItem
           v-for="todo in filteredTodos"
           :key="todo.id"
           :todo="todo"
           @todo-updated="handleTodoUpdated"
           @todo-deleted="handleTodoDeleted"
           @edit="handleEditTodo"
         />
       </div>
       
       <!-- Edit Modal -->
       <Modal 
         :is-open="!!editingTodo"
         :title="$t('forms.editTodo')"
         @close="handleEditCancel"
       >
         <TodoForm 
           :initial-todo="editingTodo"
           :is-editing="true"
           @todo-updated="handleEditSave"
           @cancel="handleEditCancel"
         />
       </Modal>
    </div>
    
    <!-- Statistics -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ totalTodos }}</div>
        <div class="stat-label">{{ $t('todoList.totalTodos') }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">{{ pendingTodos }}</div>
        <div class="stat-label">{{ $t('todoList.pendingTodos') }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">{{ completedTodos }}</div>
        <div class="stat-label">{{ $t('todoList.completedTodos') }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">{{ completionRate }}%</div>
        <div class="stat-label">{{ $t('todoList.completionRate') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
 import { ref, computed, onMounted } from 'vue'
 import { useI18n } from 'vue-i18n'
 import { useRouter } from 'vue-router'
 import TodoItem from '../components/TodoItem.vue'
 import TodoForm from '../components/TodoForm.vue'
 import Modal from '../components/Modal.vue'
 import axios from 'axios'

export default {
  name: 'TodoList',
     components: {
     TodoItem,
     TodoForm,
     Modal
   },
     setup() {
     const { locale } = useI18n()
     const router = useRouter()
     const todos = ref([])
     const categories = ref([])
     const loading = ref(true)
     const statusFilter = ref('')
     const categoryFilter = ref('')
     const sortBy = ref('created_at')
     const editingTodo = ref(null)
    
    const currentLocale = computed(() => locale.value)
    
    const filteredTodos = computed(() => {
      // Ensure todos.value is an array
      if (!Array.isArray(todos.value)) {
        console.warn('⚠️ todos.value is not an array:', todos.value)
        return []
      }
      
      let filtered = [...todos.value]
      
      // Apply status filter
      if (statusFilter.value) {
        filtered = filtered.filter(todo => todo.status === statusFilter.value)
      }
      
      // Apply category filter
      if (categoryFilter.value) {
        filtered = filtered.filter(todo => todo.category_id === parseInt(categoryFilter.value))
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'priority':
            const priorityOrder = { 'Yüksek': 3, 'Orta': 2, 'Düşük': 1 }
            return priorityOrder[b.importance] - priorityOrder[a.importance]
          case 'title':
            return a.title.localeCompare(b.title)
          case 'due_date':
            if (!a.due_date && !b.due_date) return 0
            if (!a.due_date) return 1
            if (!b.due_date) return -1
            return new Date(a.due_date) - new Date(b.due_date)
          default:
            return new Date(b.created_at) - new Date(a.created_at)
        }
      })
      
      return filtered
    })
    
    const totalTodos = computed(() => Array.isArray(todos.value) ? todos.value.length : 0)
    const pendingTodos = computed(() => Array.isArray(todos.value) ? todos.value.filter(todo => todo.status === 'Aktif').length : 0)
    const completedTodos = computed(() => Array.isArray(todos.value) ? todos.value.filter(todo => todo.status === 'Tamamlandı').length : 0)
    const completionRate = computed(() => {
      if (totalTodos.value === 0) return 0
      return Math.round((completedTodos.value / totalTodos.value) * 100)
    })
    
    const fetchTodos = async () => {
      try {
        loading.value = true
        const response = await axios.get('/api/todos')
        // API returns { todos: [], pagination: {} }
        todos.value = response.data.todos || []
        console.log('📝 Fetched todos:', todos.value)
      } catch (error) {
        console.error('Error fetching todos:', error)
        todos.value = [] // Set empty array on error
      } finally {
        loading.value = false
      }
    }
    
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories')
        categories.value = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    const handleTodoUpdated = (updatedTodo) => {
      if (!Array.isArray(todos.value)) return
      const index = todos.value.findIndex(todo => todo.id === updatedTodo.id)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }
    }
    
         const handleTodoDeleted = (todoId) => {
       if (!Array.isArray(todos.value)) return
       
       // Remove todo from local state
       todos.value = todos.value.filter(todo => todo.id !== todoId)
       
       // Refresh todos from server to ensure sync
       fetchTodos()
       
       console.log('✅ Todo removed from UI:', todoId)
     }
     
     const handleEditTodo = (todo) => {
       // Set todo for inline editing
       editingTodo.value = { ...todo }
       console.log('✏️ Editing todo:', editingTodo.value)
     }
     
     const handleEditCancel = () => {
       editingTodo.value = null
       console.log('❌ Edit cancelled')
     }
     
     const handleEditSave = async (updatedTodo) => {
       try {
         console.log('🔄 Processing todo update:', updatedTodo)
         
         // Update todo in local state
         if (!Array.isArray(todos.value)) {
           console.warn('⚠️ todos.value is not an array')
           return
         }
         
         const index = todos.value.findIndex(todo => todo.id === updatedTodo.id)
         if (index !== -1) {
           // Update the todo in the local state
           todos.value[index] = { ...updatedTodo }
           console.log('✅ Todo updated in local state at index:', index)
         } else {
           console.warn('⚠️ Todo not found in local state:', updatedTodo.id)
         }
         
         // Exit edit mode
         editingTodo.value = null
         
         // Show success message
         console.log('✅ Todo updated successfully:', updatedTodo)
         
         // Optional: Show user feedback
         // You can add a toast notification here if you have one
         
       } catch (error) {
         console.error('❌ Error updating todo:', error)
         // Keep modal open if there's an error
         // User can try again or cancel
       }
     }
    
    onMounted(() => {
      fetchTodos()
      fetchCategories()
    })
    
         return {
       todos,
       categories,
       loading,
       statusFilter,
       categoryFilter,
       sortBy,
       editingTodo,
       filteredTodos,
       totalTodos,
       pendingTodos,
       completedTodos,
       completionRate,
       currentLocale,
       handleTodoUpdated,
       handleTodoDeleted,
       handleEditTodo,
       handleEditCancel,
       handleEditSave
     }
  }
}
</script>

<style lang="scss" scoped>
.todo-list {
  .page-header {
    text-align: center;
    margin-bottom: 3rem;
    
    h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    
    p {
      font-size: 1.1rem;
      color: #5a6c7d;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }
  
  .controls-section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    
    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      
      .filter-group {
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .filter-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          
          &:focus {
            outline: none;
            border-color: #667eea;
          }
        }
      }
    }
    
    .actions {
      text-align: right;
      
      .btn {
        padding: 0.75rem 2rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        
        &.btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }
  
  .todos-container {
    margin-bottom: 3rem;
    
    .loading {
      text-align: center;
      padding: 3rem;
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      p {
        color: #5a6c7d;
        font-size: 1.1rem;
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      
      h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      
      p {
        color: #5a6c7d;
        margin-bottom: 2rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .btn {
        padding: 0.75rem 2rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
      }
    }
    
         .todos-grid {
       display: grid;
       gap: 1.5rem;
       grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
     }
     

  }
  
  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    
    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 0.5rem;
      }
      
      .stat-label {
        color: #5a6c7d;
        font-weight: 600;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .todo-list {
    .page-header {
      h1 {
        font-size: 2rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
    
    .controls-section {
      padding: 1.5rem;
      
      .filters {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .actions {
        text-align: center;
      }
    }
    
    .todos-container {
      .todos-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .stats-section {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      
      .stat-card {
        padding: 1.5rem;
        
        .stat-number {
          font-size: 2rem;
        }
      }
    }
  }
}
</style>
