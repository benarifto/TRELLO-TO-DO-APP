<template>
  <div class="language-switcher">
    <button 
      @click="switchLanguage('tr')" 
      :class="{ active: currentLocale === 'tr' }"
      class="lang-btn"
    >
      {{ $t('language.tr') }}
    </button>
    <button 
      @click="switchLanguage('en')" 
      :class="{ active: currentLocale === 'en' }"
      class="lang-btn"
    >
      {{ $t('language.en') }}
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LanguageSwitcher',
  setup() {
    const { locale } = useI18n()
    
    const currentLocale = computed(() => locale.value)
    
    const switchLanguage = (lang) => {
      locale.value = lang
      // Store preference in localStorage
      localStorage.setItem('preferred-language', lang)
    }
    
    // Load preferred language from localStorage on mount
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && ['tr', 'en'].includes(savedLanguage)) {
      locale.value = savedLanguage
    }
    
    return {
      currentLocale,
      switchLanguage
    }
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  display: flex;
  gap: 0.5rem;
  
  .lang-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    &.active {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
    }
  }
}
</style>
