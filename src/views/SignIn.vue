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
const forgotStep = ref(1) // 1: Email, 2: Link Generated
const generatedResetLink = ref('')

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
    const token = authStore.generateResetToken(forgotEmail.value)
    if (!token) {
      authStore.loginError = 'No account found with this email.'
    } else {
      generatedResetLink.value = `${window.location.origin}/reset-password?token=${token}`
      forgotStep.value = 2
    }
  }
  forgotLoading.value = false
}

function switchTab(tab) {
  activeTab.value = tab
  forgotStep.value = 1
  generatedResetLink.value = ''
  authStore.clearMessages()
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
      
      <!-- Header -->
      <div class="flex items-center justify-center gap-3 mb-8">
        <svg class="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <h1 class="text-white text-3xl font-extrabold tracking-wide drop-shadow-md">Electronic Mgmt</h1>
      </div>

      <!-- Glassmorphic Card -->
      <div class="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5">
        
        <!-- Tab switcher (Hidden in forgot mode) -->
        <div v-if="activeTab !== 'forgot'" class="flex border-b border-white/10 mx-6 mt-6">
          <button
            @click="switchTab('login')"
            :class="activeTab === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'"
            class="flex-1 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-t-lg"
          >Login</button>
          <span class="self-center text-white/10">|</span>
          <button
            @click="switchTab('register')"
            :class="activeTab === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'"
            class="flex-1 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-t-lg"
          >Create Account</button>
        </div>

        <!-- LOGIN FORM -->
        <form v-if="activeTab === 'login'" aria-label="Login Form" @submit.prevent="handleLogin" class="px-6 py-6 space-y-5">
          <fieldset class="flex gap-3 border-none p-0 m-0 w-full" aria-label="Select Role">
            <button type="button" @click="loginRole = 'customer'"
              :aria-pressed="loginRole === 'customer'"
              :class="loginRole === 'customer' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition border focus:outline-none focus:ring-2 focus:ring-cyan-500">Customer</button>
            <button type="button" @click="loginRole = 'admin'"
              :aria-pressed="loginRole === 'admin'"
              :class="loginRole === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition border focus:outline-none focus:ring-2 focus:ring-cyan-500">Admin</button>
          </fieldset>

          <div>
            <label for="loginEmail" class="sr-only">Email address</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-medium">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input id="loginEmail" v-model="loginEmail" type="email" placeholder="Email address" required
                class="w-full pl-9 pr-4 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
            </div>
          </div>

          <div>
            <label for="loginPassword" class="sr-only">Password</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input id="loginPassword" v-model="loginPassword" :type="showLoginPass ? 'text' : 'password'" placeholder="Password" required
                class="w-full pl-9 pr-10 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
              <button type="button" @click="showLoginPass = !showLoginPass" :aria-label="showLoginPass ? 'Hide password' : 'Show password'" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white focus:outline-none focus:text-cyan-400 focus:ring-2 focus:ring-cyan-500 rounded-md transition-colors">
                <svg v-if="!showLoginPass" class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-8 0-1.09.252-2.124.7-3.05M6.34 6.34A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 8 0 1.347-.328 2.617-.912 3.737M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <button @click="switchTab('forgot')" type="button" class="text-xs text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded px-1 transition-colors">Forgot password?</button>
          </div>

          <div aria-live="polite" class="min-h-[20px]">
            <p v-if="authStore.loginError" class="text-red-400 text-xs px-1" role="alert">{{ authStore.loginError }}</p>
            <p v-if="authStore.registerSuccess" class="text-emerald-400 text-xs px-1 font-medium" role="status">{{ authStore.registerSuccess }}</p>
          </div>

          <button type="submit" :disabled="loginLoading"
            :aria-busy="loginLoading"
            class="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0B0F19]">
            {{ loginLoading ? 'Authenticating...' : 'Sign In To System' }}
          </button>
        </form>

        <!-- REGISTER FORM -->
        <form v-else-if="activeTab === 'register'" aria-label="Registration Form" @submit.prevent="handleRegister" class="px-6 py-6 space-y-5">
          <fieldset class="flex gap-3 border-none p-0 m-0 w-full" aria-label="Select Role">
            <button type="button" @click="registerRole = 'customer'"
              :aria-pressed="registerRole === 'customer'"
              :class="registerRole === 'customer' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition border focus:outline-none focus:ring-2 focus:ring-cyan-500">Customer</button>
            <button type="button" @click="registerRole = 'admin'"
              :aria-pressed="registerRole === 'admin'"
              :class="registerRole === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition border focus:outline-none focus:ring-2 focus:ring-cyan-500">Admin</button>
          </fieldset>

          <div>
            <label for="regName" class="sr-only">Full Name</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <input id="regName" v-model="regName" type="text" placeholder="Full Name" required
                class="w-full pl-9 pr-4 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
            </div>
          </div>

          <div>
            <label for="regEmail" class="sr-only">Email address</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input id="regEmail" v-model="regEmail" type="email" placeholder="Email address" required
                class="w-full pl-9 pr-4 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
            </div>
          </div>

          <div>
            <label for="regPassword" class="sr-only">Password (min 6 characters)</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input id="regPassword" v-model="regPassword" :type="showRegPass ? 'text' : 'password'" placeholder="Password (min 6)" required
                class="w-full pl-9 pr-10 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
              <button type="button" @click="showRegPass = !showRegPass" :aria-label="showRegPass ? 'Hide password' : 'Show password'" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white focus:outline-none focus:text-cyan-400 focus:ring-2 focus:ring-cyan-500 rounded-md transition-colors">
                <svg v-if="!showRegPass" class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-8 0-1.09.252-2.124.7-3.05M6.34 6.34A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 8 0 1.347-.328 2.617-.912 3.737M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label for="regConfirm" class="sr-only">Confirm password</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </span>
              <input id="regConfirm" v-model="regConfirm" :type="showRegConfirm ? 'text' : 'password'" placeholder="Confirm password" required
                class="w-full pl-9 pr-10 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
              <button type="button" @click="showRegConfirm = !showRegConfirm" :aria-label="showRegConfirm ? 'Hide confirm password' : 'Show confirm password'" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white focus:outline-none focus:text-cyan-400 focus:ring-2 focus:ring-cyan-500 rounded-md transition-colors">
                <svg v-if="!showRegConfirm" class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-8 0-1.09.252-2.124.7-3.05M6.34 6.34A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 8 0 1.347-.328 2.617-.912 3.737M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>

          <div aria-live="polite" class="min-h-[20px]">
            <p v-if="authStore.registerError" class="text-red-400 text-xs px-1" role="alert">{{ authStore.registerError }}</p>
          </div>

          <button type="submit" :disabled="regLoading"
            :aria-busy="regLoading"
            class="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0B0F19]">
            {{ regLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <!-- FORGOT PASSWORD FORM -->
        <form v-else-if="activeTab === 'forgot'" aria-label="Forgot Password Form" @submit.prevent="handleForgotSubmit" class="px-6 py-6 space-y-5">
          <div class="flex items-center gap-2 mb-2 text-slate-200">
            <button @click="switchTab('login')" type="button" aria-label="Back to Login" class="hover:bg-white/10 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <svg class="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <h3 class="font-bold text-lg">Reset Password</h3>
          </div>

          <div v-if="forgotStep === 1">
            <p class="text-sm text-slate-400 mb-6">Enter your email address and we'll send you a secure reset link to recover your account.</p>
            <div>
              <label for="forgotEmail" class="sr-only">Email address</label>
              <div class="relative group">
                <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input id="forgotEmail" v-model="forgotEmail" type="email" placeholder="Email address" required
                  class="w-full pl-9 pr-4 py-3 bg-[#0B0F19]/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"/>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-cyan-900/40 border border-cyan-500/30 text-cyan-200 p-5 rounded-xl text-sm backdrop-blur-md">
              <p class="font-bold mb-2 flex items-center gap-2 text-cyan-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Simulated Email Sent!
              </p>
              <p class="mb-4 text-cyan-100/70">In a real application, an email would be delivered to <strong class="text-white">{{ forgotEmail }}</strong>. For this demo, please click the secure token link below:</p>
              <a :href="generatedResetLink" class="text-white font-bold hover:text-cyan-300 break-all block p-3 bg-black/40 rounded-lg border border-cyan-500/50 shadow-inner transition-colors" aria-label="Reset Password Link">
                {{ generatedResetLink }}
              </a>
            </div>
            
            <button @click="switchTab('login')" type="button" class="mt-4 w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-500">
              Back to Login
            </button>
          </div>

          <div aria-live="polite" class="min-h-[20px]" v-if="forgotStep === 1">
            <p v-if="authStore.loginError" class="text-red-400 text-xs px-1" role="alert">{{ authStore.loginError }}</p>
          </div>

          <button v-if="forgotStep === 1" type="submit" :disabled="forgotLoading"
            :aria-busy="forgotLoading"
            class="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0B0F19]">
            {{ forgotLoading ? 'Generating Link...' : 'Send Reset Link' }}
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
