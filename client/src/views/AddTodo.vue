<template>
  <div class="add-todo">
    <div class="page-header">
      <h1>{{ $t('addTodo.title') }}</h1>
      <p>{{ $t('addTodo.description') }}</p>
    </div>
    
    <div class="form-container">
      <TodoForm @todo-added="handleTodoAdded" />
    </div>
    
    <div class="navigation-links">
      <router-link to="/" class="nav-link">
        ← {{ $t('addTodo.backToHome') }}
      </router-link>
      <router-link to="/todo-list" class="nav-link">
        {{ $t('addTodo.viewAllTodos') }} →
      </router-link>
    </div>
  </div>
</template>

<script>
import TodoForm from '../components/TodoForm.vue'
import axios from 'axios'

export default {
  name: 'AddTodo',
  components: {
    TodoForm
  },
  methods: {
    async handleTodoAdded(formData) {
      try {
        // Submit the form data to the API
        const response = await axios.post('/api/todos', formData)
        
        // Show success message
        alert(this.$t('messages.todoCreated'))
        
        // Redirect to todo list
        this.$router.push('/todo-list')
      } catch (error) {
        console.error('Error creating todo:', error)
        alert(this.$t('messages.error'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-todo {
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
  
  .form-container {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }
  
  .navigation-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    
    .nav-link {
      color: #667eea;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      &:hover {
        background-color: #f8f9ff;
        border-color: #667eea;
        transform: translateY(-1px);
      }
    }
  }
}

@media (max-width: 768px) {
  .add-todo {
    .page-header {
      h1 {
        font-size: 2rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
    
    .form-container {
      padding: 1.5rem;
    }
    
    .navigation-links {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }
  }
}
</style>
