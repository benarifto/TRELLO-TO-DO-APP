<template>
  <div class="todo-item" :class="{ completed: todo.status === 'Tamamlandı' }">
    <div class="todo-content">
      <div class="todo-header">
        <div class="todo-title">
          <h3>{{ todo.title }}</h3>
          <div class="todo-meta">
            <span class="created-date">{{ formatDate(todo.created_at) }}</span>
            <span class="importance-badge" :class="getImportanceClass(todo.importance)">
              {{ todo.importance }}
            </span>
          </div>
        </div>
        
        <div class="todo-status">
          <span class="status-badge" :class="getStatusClass(todo.status)">
            {{ todo.status }}
          </span>
        </div>
      </div>
      
      <div class="todo-details">
        <p v-if="todo.description" class="description">{{ todo.description }}</p>
        
        <div class="category-info">
          <span class="category-badge">
            {{ currentLocale === 'tr' ? todo.category_name_tr : todo.category_name_en }}
          </span>
        </div>
        
                 <div v-if="todo.image_path" class="todo-image">
           <img :src="`http://localhost:3000/uploads/${todo.image_path}`" :alt="todo.title" />
         </div>
      </div>
    </div>
    
    <div class="todo-actions">
      <div class="action-group">
        <select 
          v-model="selectedImportance" 
          @change="updateImportance"
          :disabled="todo.status === 'Tamamlandı'"
          class="importance-select"
        >
          <option value="Yüksek">{{ $t('importance.high') }}</option>
          <option value="Orta">{{ $t('importance.medium') }}</option>
          <option value="Düşük">{{ $t('importance.low') }}</option>
        </select>
        
        <button 
          v-if="todo.status === 'Aktif'"
          @click="markCompleted" 
          class="btn btn-success"
          :title="$t('forms.markCompleted')"
        >
          ✓
        </button>
      </div>
      
      <div class="action-group">
        <button 
          @click="$emit('edit', todo)" 
          class="btn btn-edit"
          :title="$t('forms.edit')"
        >
          ✏️
        </button>
        
        <button 
          @click="confirmDelete" 
          class="btn btn-delete"
          :title="$t('forms.delete')"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

export default {
  name: 'TodoItem',
  props: {
    todo: {
      type: Object,
      required: true
    }
  },
  emits: ['todo-updated', 'todo-deleted', 'edit'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const selectedImportance = ref(props.todo.importance)
    
    const currentLocale = computed(() => locale.value)
    
    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString(currentLocale.value === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Get importance class
    const getImportanceClass = (importance) => {
      const classes = {
        'Yüksek': 'high',
        'Orta': 'medium',
        'Düşük': 'low'
      }
      return classes[importance] || 'medium'
    }
    
    // Get status class
    const getStatusClass = (status) => {
      return status === 'Tamamlandı' ? 'completed' : 'active'
    }
    
    // Update importance
    const updateImportance = async () => {
      try {
        const response = await axios.patch(`/api/todos/${props.todo.id}/importance`, {
          importance: selectedImportance.value
        })
        emit('todo-updated', response.data)
      } catch (error) {
        console.error('Error updating importance:', error)
        // Reset to original value
        selectedImportance.value = props.todo.importance
      }
    }
    
    // Mark as completed
    const markCompleted = async () => {
      try {
        const response = await axios.patch(`/api/todos/${props.todo.id}/status`, {
          status: 'Tamamlandı'
        })
        emit('todo-updated', response.data)
      } catch (error) {
        console.error('Error marking as completed:', error)
      }
    }
    
    // Confirm delete
    const confirmDelete = async () => {
      if (confirm(t('messages.confirmDelete'))) {
        try {
          // Call API to delete todo
          await axios.delete(`/api/todos/${props.todo.id}`)
          
          // Emit event to parent to update UI
          emit('todo-deleted', props.todo.id)
          
          console.log('✅ Todo deleted successfully:', props.todo.id)
        } catch (error) {
          console.error('❌ Error deleting todo:', error)
          alert(t('messages.error'))
        }
      }
    }
    
    onMounted(() => {
      selectedImportance.value = props.todo.importance
    })
    
    return {
      selectedImportance,
      currentLocale,
      formatDate,
      getImportanceClass,
      getStatusClass,
      updateImportance,
      markCompleted,
      confirmDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.todo-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  &.completed {
    opacity: 0.7;
    border-left-color: #27ae60;
    
    .todo-title h3 {
      text-decoration: line-through;
    }
  }
  
  .todo-content {
    .todo-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      
      .todo-title {
        flex: 1;
        
        h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.3rem;
        }
        
        .todo-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          
          .created-date {
            color: #666;
            font-size: 0.9rem;
          }
          
          .importance-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            
            &.high {
              background: #ffebee;
              color: #c62828;
            }
            
            &.medium {
              background: #fff3e0;
              color: #ef6c00;
            }
            
            &.low {
              background: #e8f5e8;
              color: #2e7d32;
            }
          }
        }
      }
      
      .todo-status {
        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          
          &.active {
            background: #e3f2fd;
            color: #1976d2;
          }
          
          &.completed {
            background: #e8f5e8;
            color: #2e7d32;
          }
        }
      }
    }
    
    .todo-details {
      .description {
        color: #666;
        margin-bottom: 1rem;
        line-height: 1.5;
      }
      
      .category-info {
        margin-bottom: 1rem;
        
        .category-badge {
          background: #f3e5f5;
          color: #7b1fa2;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
      }
      
      .todo-image {
        img {
          max-width: 150px;
          max-height: 100px;
          border-radius: 8px;
          border: 2px solid #e1e5e9;
        }
      }
    }
  }
  
  .todo-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e1e5e9;
    
    .action-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      
      .importance-select {
        padding: 0.5rem;
        border: 2px solid #e1e5e9;
        border-radius: 6px;
        font-size: 0.9rem;
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
      
      .btn {
        padding: 0.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
        
        &:hover:not(:disabled) {
          transform: scale(1.1);
        }
        
        &.btn-success {
          background: #27ae60;
          color: white;
          
          &:hover {
            background: #229954;
          }
        }
        
        &.btn-edit {
          background: #f39c12;
          color: white;
          
          &:hover {
            background: #e67e22;
          }
        }
        
        &.btn-delete {
          background: #e74c3c;
          color: white;
          
          &:hover {
            background: #c0392b;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .todo-item {
    .todo-header {
      flex-direction: column;
      gap: 1rem;
      
      .todo-status {
        align-self: flex-start;
      }
    }
    
    .todo-actions {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
      
      .action-group {
        justify-content: center;
      }
    }
  }
}
</style>
