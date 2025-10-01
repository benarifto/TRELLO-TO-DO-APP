<template>
  <div class="edit-todo">
    <div class="page-header">
      <h1>{{ $t('editTodo.title') }}</h1>
      <p>{{ $t('editTodo.description') }}</p>
    </div>
    
    <div class="edit-form-container">
      <TodoForm 
        :initial-todo="todo"
        :is-editing="true"
        @todo-updated="handleTodoUpdated"
        @cancel="goBack"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TodoForm from '../components/TodoForm.vue'
import axios from 'axios'

export default {
  name: 'EditTodo',
  components: {
    TodoForm
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const todo = ref(null)
    const loading = ref(true)
    const error = ref(null)

    const fetchTodo = async () => {
      try {
        loading.value = true
        const response = await axios.get(`/api/todos/${route.params.id}`)
        todo.value = response.data
        console.log('📝 Fetched todo for editing:', todo.value)
      } catch (err) {
        console.error('Error fetching todo:', err)
        error.value = t('messages.error')
      } finally {
        loading.value = false
      }
    }

    const handleTodoUpdated = (updatedTodo) => {
      console.log('✅ Todo updated successfully:', updatedTodo)
      // Navigate back to todo list
      router.push('/todo-list')
    }

    const goBack = () => {
      router.push('/todo-list')
    }

    onMounted(() => {
      fetchTodo()
    })

    return {
      todo,
      loading,
      error,
      handleTodoUpdated,
      goBack
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-todo {
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
  
  .edit-form-container {
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .edit-todo {
    .page-header {
      h1 {
        font-size: 2rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
  }
}
</style>
