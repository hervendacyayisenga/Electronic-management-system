import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

// 1. Create the main Vue application instance
const app = createApp(App)

// 2. Create a Pinia instance for global state management (replaces Vuex)
const pinia = createPinia()

// 3. Register plugins with the Vue app
app.use(pinia)   // Enables global stores (like authStore and productStore)
app.use(router)  // Enables page navigation based on URLs

// 4. Initialize critical application state before mounting
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore(pinia)

// Seed default admin account on every startup (safe – checks for duplicates in local storage)
// This ensures we always have a way to log into the admin dashboard at /admin
authStore.seedDefaultUsers()

// 5. Finally, mount the Vue application to the <div id="app"> element in index.html
app.mount('#app')
