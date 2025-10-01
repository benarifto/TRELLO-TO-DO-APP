<template>
  <div id="app">
    <!-- Preloader -->
    <Preloader v-if="showPreloader" />
    
    <!-- Main App Content -->
    <div v-else>
      <!-- Navigation -->
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <h1>{{ $t('app.title') }}</h1>
          </div>
          
          <div class="nav-menu">
            <router-link to="/" class="nav-link">{{ $t('navigation.home') }}</router-link>
            <router-link to="/add-todo" class="nav-link">{{ $t('navigation.addTodo') }}</router-link>
            <router-link to="/todo-list" class="nav-link">{{ $t('navigation.todoList') }}</router-link>
          </div>
          
          <div class="nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Preloader from './components/Preloader.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    Preloader,
    LanguageSwitcher
  },
  setup() {
    const showPreloader = ref(true)
    
    onMounted(() => {
      // Show preloader for 2 seconds on first load
      setTimeout(() => {
        showPreloader.value = false
      }, 2000)
    })
    
    return {
      showPreloader
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .nav-brand h1 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .nav-menu {
      display: flex;
      gap: 2rem;
      
      .nav-link {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        transition: background-color 0.3s ease;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        &.router-link-active {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
    }
  }
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

// Responsive design
@media (max-width: 768px) {
  .navbar .nav-container {
    flex-direction: column;
    gap: 1rem;
    
    .nav-menu {
      gap: 1rem;
    }
  }
  
  .main-content {
    padding: 0 1rem;
  }
}
</style>
