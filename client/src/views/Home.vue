<template>
  <div class="home">
    <div class="hero-section">
      <h1>{{ $t('home.welcome') }}</h1>
      <p class="subtitle">{{ $t('home.description') }}</p>
      
      <div class="cta-buttons">
        <router-link to="/add-todo" class="btn btn-primary">
          {{ $t('home.addFirstTodo') }}
        </router-link>
        <router-link to="/todo-list" class="btn btn-secondary">
          {{ $t('home.viewTodos') }}
        </router-link>
      </div>
    </div>
    
    <div class="features-section">
      <h2>{{ $t('home.features') }}</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>{{ $t('home.feature1.title') }}</h3>
          <p>{{ $t('home.feature1.description') }}</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🏷️</div>
          <h3>{{ $t('home.feature2.title') }}</h3>
          <p>{{ $t('home.feature2.description') }}</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>{{ $t('home.feature3.title') }}</h3>
          <p>{{ $t('home.feature3.description') }}</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🌐</div>
          <h3>{{ $t('home.feature4.title') }}</h3>
          <p>{{ $t('home.feature4.description') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style lang="scss" scoped>
.home {
  .hero-section {
    text-align: center;
    padding: 4rem 0;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    margin-bottom: 3rem;
    
    h1 {
      font-size: 3rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: #5a6c7d;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }
    
    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      
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
        
        &.btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          
          &:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
          }
        }
      }
    }
  }
  
  .features-section {
    h2 {
      text-align: center;
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 3rem;
      font-weight: 600;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      
      .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.3rem;
          font-weight: 600;
        }
        
        p {
          color: #5a6c7d;
          line-height: 1.6;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home {
    .hero-section {
      padding: 2rem 1rem;
      
      h1 {
        font-size: 2rem;
      }
      
      .subtitle {
        font-size: 1rem;
      }
      
      .cta-buttons {
        flex-direction: column;
        align-items: center;
        
        .btn {
          width: 100%;
          max-width: 300px;
        }
      }
    }
    
    .features-section {
      h2 {
        font-size: 2rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
  }
}
</style>
