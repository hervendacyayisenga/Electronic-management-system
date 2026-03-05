<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const token = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showNewPass = ref(false)
const showConfirmPass = ref(false)

const errorMsg = ref('')
const loading = ref(false)
const successMsg = ref('')

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    errorMsg.value = 'Invalid or missing reset token. Ensure you clicked the correct link.'
  }
})

async function handleResetPassword() {
  errorMsg.value = ''
  if (!token.value) {
    errorMsg.value = 'Missing token.'
    return
  }
  
  if (newPassword.value !== confirmNewPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  await new Promise(r => setTimeout(r, 600)) // network simulation

  const res = authStore.resetPasswordWithToken(token.value, newPassword.value)
  loading.value = false

  if (res.ok) {
    successMsg.value = 'Password reset successfully!'
    setTimeout(() => {
      router.push({ name: 'SignIn' })
    }, 2000)
  } else {
    errorMsg.value = res.error
  }
}
</script>

<template>
  <div class="min-h-screen flex relative bg-[#0B0F19]">
    
    <!-- Full-screen Background Image with Dark Overlay -->
    <div class="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <img src="../assets/login-bg.png" class="absolute inset-0 w-full h-full object-cover scale-105" alt="Electronics Background" />
      <div class="absolute inset-0 bg-gradient-to-tr from-[#0B0F19]/95 via-[#0B0F19]/80 to-[#1e1b4b]/60 mix-blend-multiply"></div>
      <div class="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
    </div>

    <!-- Centered Form Container -->
    <div class="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 w-full">
      
      <!-- Glassmorphic Card -->
      <div class="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 ring-1 ring-white/5">
        
        <div class="text-center mb-8">
          <svg class="mx-auto h-12 w-12 text-cyan-400 mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <h2 class="text-3xl font-extrabold text-white tracking-wide">Reset Password</h2>
          <p class="mt-3 text-sm text-slate-300">
            Choose a new, secure password for your account.
          </p>
        </div>

        <div v-if="successMsg" class="rounded-xl bg-emerald-900/40 p-5 mb-6 border border-emerald-500/30 backdrop-blur-sm">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-bold text-emerald-300">{{ successMsg }}</h3>
              <p class="text-sm text-emerald-200/70 mt-1">Redirecting to login...</p>
            </div>
          </div>
        </div>

        <form v-else class="space-y-6" @submit.prevent="handleResetPassword">
          <div v-if="errorMsg" class="rounded-xl bg-red-900/40 p-4 border border-red-500/30 backdrop-blur-sm">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-300 font-medium">{{ errorMsg }}</p>
            </div>
          </div>

          <div v-show="token">
            <div class="space-y-4">
              <div>
                <label for="newPassword" class="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div class="relative group">
                  <input id="newPassword" v-model="newPassword" :type="showNewPass ? 'text' : 'password'" required
                    class="w-full pl-4 pr-16 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all" placeholder="••••••••" />
                  <button type="button" @click="showNewPass = !showNewPass" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white focus:outline-none focus:text-cyan-400 transition-colors">
                    <span class="text-xs font-bold tracking-wider">{{ showNewPass ? 'HIDE' : 'SHOW' }}</span>
                  </button>
                </div>
              </div>

              <div>
                <label for="confirmNewPassword" class="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <div class="relative group">
                  <input id="confirmNewPassword" v-model="confirmNewPassword" :type="showConfirmPass ? 'text' : 'password'" required
                    class="w-full pl-4 pr-16 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all" placeholder="••••••••" />
                  <button type="button" @click="showConfirmPass = !showConfirmPass" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white focus:outline-none focus:text-cyan-400 transition-colors">
                    <span class="text-xs font-bold tracking-wider">{{ showConfirmPass ? 'HIDE' : 'SHOW' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <button type="submit" :disabled="loading"
                class="w-full flex justify-center py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] focus:ring-cyan-500 disabled:opacity-50 disabled:shadow-none transition-all">
                {{ loading ? 'Updating...' : 'Set New Password' }}
              </button>
            </div>
          </div>
          
          <div class="text-center mt-6">
            <router-link :to="{ name: 'SignIn' }" class="font-medium text-cyan-400 hover:text-cyan-300 text-sm transition-colors focus:outline-none focus:underline">
              &larr; Back to login
            </router-link>
          </div>
        </form>
        
      </div>
    </div>
  </div>
</template>
