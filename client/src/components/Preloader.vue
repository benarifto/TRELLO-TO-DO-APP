<template>
  <div class="preloader">
    <div class="preloader-content">
      <div class="spinner"></div>
      <h2>{{ $t('app.loading') }}</h2>
      <p>Trello TODO Uygulaması yükleniyor...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Preloader'
}
</script>

<style lang="scss" scoped>
.preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  
  .preloader-content {
    text-align: center;
    color: white;
    
    h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      font-weight: 300;
    }
    
    p {
      font-size: 1.1rem;
      opacity: 0.8;
    }
  }
  
  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
