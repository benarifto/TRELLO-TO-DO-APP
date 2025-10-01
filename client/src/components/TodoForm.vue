<template>
  <div class="todo-form">
    <h2>{{ isEditing ? $t('forms.editTodo') : $t('forms.addTodo') }}</h2>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="title">{{ $t('todo.title') }} *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          :placeholder="$t('todo.title')"
          maxlength="100"
          required
          :class="{ error: errors.title }"
        />
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        <span class="char-count">{{ form.title.length }}/100</span>
      </div>
      
      <div class="form-group">
        <label for="description">{{ $t('todo.description') }}</label>
        <textarea
          id="description"
          v-model="form.description"
          :placeholder="$t('todo.description')"
          rows="4"
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="category">{{ $t('todo.category') }} *</label>
          <select
            id="category"
            v-model="form.category_id"
            required
            :class="{ error: errors.category_id }"
          >
            <option value="">{{ $t('filters.allCategories') }}</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ currentLocale === 'tr' ? category.name_tr : category.name_en }}
            </option>
          </select>
          <span v-if="errors.category_id" class="error-message">{{ errors.category_id }}</span>
        </div>
        
                 <div class="form-group">
           <label for="importance">{{ $t('todo.importance') }} *</label>
           <select
             id="importance"
             v-model="form.importance"
             required
             :class="{ error: errors.importance }"
           >
             <option value="">{{ $t('filters.allImportance') }}</option>
             <option value="Yüksek">{{ $t('importance.high') }}</option>
             <option value="Orta">{{ $t('importance.medium') }}</option>
             <option value="Düşük">{{ $t('importance.low') }}</option>
           </select>
           <span v-if="errors.importance" class="error-message">{{ errors.importance }}</span>
         </div>
         
         <div class="form-group" v-if="isEditing">
           <label for="status">{{ $t('todo.status') }}</label>
           <select
             id="status"
             v-model="form.status"
             :class="{ error: errors.status }"
           >
             <option value="Aktif">{{ $t('status.pending') }}</option>
             <option value="Tamamlandı">{{ $t('status.completed') }}</option>
           </select>
           <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
         </div>
      </div>
      
      <div class="form-group">
        <label for="image">{{ $t('todo.image') }}</label>
                 <input
           id="image"
           type="file"
           accept="image/png,image/jpeg,image/jpg"
           @change="handleImageChange"
           ref="imageInput"
         />
        <span class="file-info">{{ $t('validation.imageFormat') }}, {{ $t('validation.imageSize') }}</span>
        
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Preview" />
          <button type="button" @click="removeImage" class="remove-image">
            ×
          </button>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? '...' : (isEditing ? $t('forms.update') : $t('forms.save')) }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
          {{ $t('forms.cancel') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

export default {
  name: 'TodoForm',
  props: {
    initialTodo: {
      type: Object,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['todo-added', 'todo-updated', 'cancel'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const imageInput = ref(null)
    
         const form = reactive({
       title: '',
       description: '',
       category_id: '',
       importance: '',
       status: 'Aktif',
       image: null,
       removeExistingImage: false
     })
    
    const errors = reactive({})
    const isSubmitting = ref(false)
    const categories = ref([])
    const imagePreview = ref('')
    
    const currentLocale = computed(() => locale.value)
    
    // Load categories
    const loadCategories = async () => {
      try {
        const response = await axios.get('/api/categories')
        categories.value = response.data
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    
         // Handle image change
     const handleImageChange = (event) => {
       const file = event.target.files[0]
       if (file) {
         console.log('📸 File selected:', {
           name: file.name,
           type: file.type,
           size: file.size,
           sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
         })
         
         // Validate file type - support JPG, JPEG, and PNG
         const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
         if (!allowedTypes.includes(file.type)) {
           console.warn('⚠️ Unsupported file type:', file.type)
           errors.image = t('validation.imageFormat')
           return
         }
         
         // Validate file size (5MB - increased for better user experience)
         const maxSize = 5 * 1024 * 1024 // 5MB
         if (file.size > maxSize) {
           console.warn('⚠️ File too large:', file.size, 'bytes')
           errors.image = t('validation.imageSize')
           return
         }
         
         // Clear any previous errors
         errors.image = ''
         form.image = file
         
         // Create preview with better error handling
         const reader = new FileReader()
         reader.onload = (e) => {
           imagePreview.value = e.target.result
           console.log('✅ Image preview created successfully')
         }
         reader.onerror = (error) => {
           console.error('❌ Error reading image file:', error)
           errors.image = 'Resim dosyası okunamadı'
         }
         reader.readAsDataURL(file)
       }
     }
    
         // Remove image
     const removeImage = () => {
       form.image = null
       imagePreview.value = ''
       if (imageInput.value) {
         imageInput.value.value = ''
       }
       
       // If editing and there was a previous image, mark it for removal
       if (props.isEditing && props.initialTodo?.image_path) {
         console.log('🗑️ Marking existing image for removal:', props.initialTodo.image_path)
         // Set a flag to indicate image removal
         form.removeExistingImage = true
       }
     }
    
    // Validate form
    const validateForm = () => {
      errors.title = ''
      errors.category_id = ''
      errors.importance = ''
      
      if (!form.title.trim()) {
        errors.title = t('validation.titleRequired')
        return false
      }
      
      if (form.title.length > 100) {
        errors.title = t('validation.titleMaxLength')
        return false
      }
      
      if (!form.category_id) {
        errors.category_id = t('validation.categoryRequired')
        return false
      }
      
      if (!form.importance) {
        errors.importance = t('validation.importanceRequired')
        return false
      }
      
      return true
    }
    
         // Handle form submit
     const handleSubmit = async () => {
       if (!validateForm()) return
       
       isSubmitting.value = true
       
       try {
         const formData = new FormData()
         formData.append('title', form.title)
         formData.append('description', form.description)
         formData.append('category_id', form.category_id)
         formData.append('importance', form.importance)
         
         if (props.isEditing) {
           formData.append('status', form.status)
         }
         
                   if (form.image) {
            formData.append('image', form.image)
          } else if (form.removeExistingImage) {
            // Send a special flag to indicate image removal
            formData.append('removeImage', 'true')
          }
         
         console.log('📝 Submitting form data:', {
           isEditing: props.isEditing,
           todoId: props.isEditing ? props.initialTodo.id : 'new',
           formData: Object.fromEntries(formData.entries())
         })
         
         if (props.isEditing) {
           // Update existing todo
           console.log('🔄 Updating todo with ID:', props.initialTodo.id)
           const response = await axios.put(`/api/todos/${props.initialTodo.id}`, formData, {
             headers: {
               'Content-Type': 'multipart/form-data'
             },
             timeout: 30000 // 30 second timeout
           })
           
           console.log('✅ Update response:', response.data)
           emit('todo-updated', response.data)
         } else {
           // Create new todo
           console.log('➕ Creating new todo')
           emit('todo-added', formData)
         }
       } catch (error) {
         console.error('❌ Form submission error:', error)
         
         // Show user-friendly error message
         if (error.response) {
           const errorMessage = error.response.data?.error || 'Güncelleme sırasında bir hata oluştu'
           alert(errorMessage)
         } else if (error.code === 'ECONNABORTED') {
           alert('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.')
         } else {
           alert('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
         }
       } finally {
         isSubmitting.value = false
       }
     }
    
         // Initialize form with todo data if editing
     const initForm = () => {
       if (props.initialTodo) {
         form.title = props.initialTodo.title
         form.description = props.initialTodo.description || ''
         form.category_id = props.initialTodo.category_id
         form.importance = props.initialTodo.importance
         form.status = props.initialTodo.status || 'Aktif'
         form.removeExistingImage = false // Reset flag
         
         if (props.initialTodo.image_path) {
           imagePreview.value = `http://localhost:3000/uploads/${props.initialTodo.image_path}`
         }
         
         console.log('📝 Form initialized with:', {
           title: form.title,
           description: form.description,
           category_id: form.category_id,
           importance: form.importance,
           status: form.status,
           removeExistingImage: form.removeExistingImage
         })
       }
     }
    
    onMounted(() => {
      loadCategories()
      if (props.isEditing) {
        initForm()
      }
    })
    
    return {
      form,
      errors,
      isSubmitting,
      categories,
      imageInput,
      imagePreview,
      currentLocale,
      handleImageChange,
      removeImage,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.todo-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 1.8rem;
  }
  
  .form {
    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #555;
      }
      
      input, textarea, select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: #667eea;
        }
        
        &.error {
          border-color: #e74c3c;
        }
      }
      
      textarea {
        resize: vertical;
        min-height: 100px;
      }
      
      .error-message {
        color: #e74c3c;
        font-size: 0.9rem;
        margin-top: 0.25rem;
        display: block;
      }
      
      .char-count {
        color: #999;
        font-size: 0.8rem;
        text-align: right;
        margin-top: 0.25rem;
        display: block;
      }
      
      .file-info {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        display: block;
      }
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .image-preview {
      position: relative;
      margin-top: 1rem;
      
      img {
        max-width: 200px;
        max-height: 150px;
        border-radius: 8px;
        border: 2px solid #e1e5e9;
      }
      
      .remove-image {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        
        &:hover {
          background: #c0392b;
        }
      }
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      
      .btn {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
        
        &.btn-secondary {
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e1e5e9;
          
          &:hover {
            background: #e9ecef;
            border-color: #adb5bd;
          }
        }
      }
    }
  }
}
</style>
