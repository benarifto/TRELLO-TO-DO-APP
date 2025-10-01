<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button 
              type="button" 
              class="modal-close-btn"
              @click="$emit('close')"
              :aria-label="$t('common.close')"
            >
              ×
            </button>
          </div>
          
          <!-- Modal Content -->
          <div class="modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    // Handle overlay click to close modal
    const handleOverlayClick = () => {
      emit('close')
    }

    // Handle escape key to close modal
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && props.isOpen) {
        emit('close')
      }
    }

    // Add/remove event listeners
    onMounted(() => {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when modal is open
      if (props.isOpen) {
        document.body.style.overflow = 'hidden'
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscapeKey)
      // Restore body scroll
      document.body.style.overflow = ''
    })

    // Watch for modal open/close to manage body scroll
    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    })

    return {
      handleOverlayClick
    }
  }
}
</script>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  // Animation for overlay
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  
  // Animation for modal
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
  
  .modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .modal-close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #e9ecef;
      color: #495057;
      transform: scale(1.1);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
    }
  }
}

.modal-content {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px); // Account for header height
}

// Responsive design
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
    
    .modal-title {
      font-size: 1.25rem;
    }
  }
  
  .modal-content {
    padding: 1.5rem;
  }
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Transition classes for Vue transitions
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  
  .modal-container {
    transform: translateY(-20px) scale(0.95);
  }
}

.modal-leave-to {
  opacity: 0;
  
  .modal-container {
    transform: translateY(20px) scale(0.95);
  }
}
</style>
