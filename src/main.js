import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Seed default admin account on every startup (safe – checks for duplicates)
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore(pinia)
authStore.seedDefaultUsers()

app.mount('#app')
