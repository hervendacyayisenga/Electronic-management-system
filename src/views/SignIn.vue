<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// View state: 'login' | 'register' | 'forgot'
const activeTab = ref('login')
const loginRole = ref('customer')
const registerRole = ref('customer')

// Forms
const loginEmail = ref('')
const loginPassword = ref('')
const loginLoading = ref(false)

const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const regLoading = ref(false)

// Forgot Password Flow
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotStep = ref(1) // 1: Email, 2: New Password
const newPassword = ref('')
const confirmNewPassword = ref('')
const resetSuccess = ref(false)

const showLoginPass = ref(false)
const showRegPass = ref(false)
const showRegConfirm = ref(false)
const showNewPass = ref(false)

authStore.clearMessages()

async function handleLogin() {
  loginLoading.value = true
  await new Promise(r => setTimeout(r, 400))
  const ok = authStore.login(loginEmail.value, loginPassword.value)
  loginLoading.value = false
  if (ok) {
    router.push(authStore.isAdmin ? { name: 'Dashboard' } : { name: 'CustomerView' })
  }
}

async function handleRegister() {
  authStore.clearMessages()
  if (regPassword.value !== regConfirm.value) {
    authStore.registerError = 'Passwords do not match.'
    return
  }
  regLoading.value = true
  await new Promise(r => setTimeout(r, 400))
  const ok = authStore.register(regName.value, regEmail.value, regPassword.value, registerRole.value)
  regLoading.value = false
  if (ok) {
    activeTab.value = 'login'
    loginEmail.value = regEmail.value
    regName.value = regEmail.value = regPassword.value = regConfirm.value = ''
  }
}

async function handleForgotSubmit() {
  authStore.clearMessages()
  forgotLoading.value = true
  await new Promise(r => setTimeout(r, 600))
  
  if (forgotStep.value === 1) {
    const user = authStore.findUserByEmail(forgotEmail.value)
    if (!user) {
      authStore.loginError = 'No account found with this email.'
    } else {
      forgotStep.value = 2
    }
  } else {
    if (newPassword.value !== confirmNewPassword.value) {
      authStore.loginError = 'Passwords do not match.'
    } else {
      const res = authStore.resetPassword(forgotEmail.value, newPassword.value)
      if (res.ok) {
        resetSuccess.value = true
        delete authStore.loginError
        setTimeout(() => {
          activeTab.value = 'login'
          resetSuccess.value = false
          forgotStep.value = 1
          forgotEmail.value = ''
          newPassword.value = ''
          confirmNewPassword.value = ''
        }, 2000)
      } else {
        authStore.loginError = res.error
      }
    }
  }
  forgotLoading.value = false
}

function switchTab(tab) {
  activeTab.value = tab
  forgotStep.value = 1
  resetSuccess.value = false
  authStore.clearMessages()
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">
    
    <!-- Left Image Side -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800">
      <img src="../assets/login-bg.png" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Electronics Background" />
      <div class="relative z-10 flex flex-col justify-end h-full px-12 lg:px-20 pb-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent w-full">
        <div class="flex items-center gap-3 mb-6">
          <svg class="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <h1 class="text-white text-3xl font-bold tracking-wide">Electronic Mgmt</h1>
        </div>
        <h2 class="text-white text-4xl font-extrabold mb-4 leading-tight">Elevate Your<br /><span class="text-blue-500">Digital Lifestyle</span></h2>
        <p class="text-slate-300 text-lg max-w-md">Securely manage and purchase premium electronic devices with our elite management system.</p>
      </div>
    </div>

    <!-- Right Form Side -->
    <div class="flex-1 flex flex-col justify-center items-center bg-slate-50 relative px-4 sm:px-6 lg:px-8 py-12">
      
      <!-- Mobile Header -->
      <div class="flex lg:hidden items-center justify-center gap-3 mb-8">
        <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <h1 class="text-slate-800 text-2xl font-bold tracking-wide">Electronic Mgmt</h1>
      </div>

      <!-- Card -->
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        <!-- Tab switcher (Hidden in forgot mode) -->
        <div v-if="activeTab !== 'forgot'" class="flex border-b border-slate-200 mx-6 mt-6">
          <button
            @click="switchTab('login')"
            :class="activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'"
            class="flex-1 py-3 text-sm transition-all"
          >Login</button>
          <span class="self-center text-slate-300">|</span>
          <button
            @click="switchTab('register')"
            :class="activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'"
            class="flex-1 py-3 text-sm transition-all"
          >Create Account</button>
        </div>

        <!-- LOGIN FORM -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="px-6 py-6 space-y-4">
          <div class="flex gap-3">
            <button type="button" @click="loginRole = 'customer'"
              :class="loginRole === 'customer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition">Customer</button>
            <button type="button" @click="loginRole = 'admin'"
              :class="loginRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition">Admin</button>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-medium">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </span>
            <input v-model="loginEmail" type="email" placeholder="Email address" required
              class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </span>
            <input v-model="loginPassword" :type="showLoginPass ? 'text' : 'password'" placeholder="Password" required
              class="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button type="button" @click="showLoginPass = !showLoginPass" class="absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg v-if="!showLoginPass" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-8 0-1.09.252-2.124.7-3.05M6.34 6.34A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 8 0 1.347-.328 2.617-.912 3.737M3 3l18 18"/>
              </svg>
            </button>
          </div>

          <div class="flex justify-end">
            <button @click="switchTab('forgot')" type="button" class="text-xs text-blue-600 hover:underline">Forgot password?</button>
          </div>

          <p v-if="authStore.loginError" class="text-red-500 text-xs px-1">{{ authStore.loginError }}</p>
          <p v-if="authStore.registerSuccess" class="text-green-600 text-xs px-1 font-medium">{{ authStore.registerSuccess }}</p>

          <button type="submit" :disabled="loginLoading"
            class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md disabled:bg-blue-300">
            {{ loginLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- REGISTER FORM -->
        <form v-else-if="activeTab === 'register'" @submit.prevent="handleRegister" class="px-6 py-6 space-y-4">
          <div class="flex gap-3">
            <button type="button" @click="registerRole = 'customer'"
              :class="registerRole === 'customer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition">Customer</button>
            <button type="button" @click="registerRole = 'admin'"
              :class="registerRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition">Admin</button>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 font-medium">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </span>
            <input v-model="regName" type="text" placeholder="Full Name" required
              class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </span>
            <input v-model="regEmail" type="email" placeholder="Email address" required
              class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </span>
            <input v-model="regPassword" :type="showRegPass ? 'text' : 'password'" placeholder="Password (min 6)" required
              class="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </span>
            <input v-model="regConfirm" :type="showRegConfirm ? 'text' : 'password'" placeholder="Confirm password" required
              class="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <p v-if="authStore.registerError" class="text-red-500 text-xs px-1">{{ authStore.registerError }}</p>

          <button type="submit" :disabled="regLoading"
            class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md disabled:bg-blue-300">
            {{ regLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <!-- FORGOT PASSWORD FORM -->
        <form v-else-if="activeTab === 'forgot'" @submit.prevent="handleForgotSubmit" class="px-6 py-6 space-y-4">
          <div class="flex items-center gap-2 mb-2 text-slate-600">
            <button @click="switchTab('login')" type="button" class="hover:bg-slate-100 p-1 rounded">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <h3 class="font-bold">Reset Password</h3>
          </div>

          <div v-if="forgotStep === 1">
            <p class="text-xs text-slate-500 mb-4">Enter your email address to find your account.</p>
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input v-model="forgotEmail" type="email" placeholder="Email address" required
                class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          <div v-else class="space-y-4">
            <p class="text-xs text-slate-600 mb-2 font-medium">Account found: <span class="text-blue-600">{{ forgotEmail }}</span></p>
            <p class="text-xs text-slate-500 italic">Enter a new secure password.</p>
            
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input v-model="newPassword" :type="showNewPass ? 'text' : 'password'" placeholder="New password" required
                class="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>

            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </span>
              <input v-model="confirmNewPassword" type="password" placeholder="Confirm new password" required
                class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          <p v-if="authStore.loginError" class="text-red-500 text-xs px-1">{{ authStore.loginError }}</p>
          <p v-if="resetSuccess" class="text-green-600 text-xs px-1 font-bold">Password reset successfully! Redirecting...</p>

          <button type="submit" :disabled="forgotLoading || resetSuccess"
            class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md disabled:bg-blue-300">
            {{ forgotLoading ? 'Processing...' : (forgotStep === 1 ? 'Find Account' : 'Reset Password') }}
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
