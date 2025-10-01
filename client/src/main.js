import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import axios from 'axios'
import App from './App.vue'
import routes from './router'
import messages from './locales'

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:3000'

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'tr', // Default to Turkish
  fallbackLocale: 'en',
  messages
})

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create and mount app
const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
