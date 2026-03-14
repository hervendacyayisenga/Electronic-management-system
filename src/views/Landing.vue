<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin() {
  router.push({ name: 'SignIn' })
}
</script>

<template>
  <div class="min-h-screen bg-[#0B0F19] relative overflow-hidden flex flex-col">
    <!-- Background Design Elements -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_50%)]"></div>
      <div class="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div class="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
      
      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      
      <!-- Icon/Logo -->
      <div class="mb-8 relative group">
        <div class="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div class="relative w-24 h-24 bg-[#0B0F19] rounded-2xl border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <svg class="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M8 9h8M8 13h6" />
          </svg>
        </div>
      </div>

      <!-- Typography -->
      <h1 class="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 tracking-tight mb-6">
        Electronic<br/> Management System
      </h1>
      
      <p class="mt-4 max-w-2xl text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
        The complete platform for tracking inventory, managing electronic device sales, and generating financial analytics seamlessly.
      </p>

      <!-- Call to Action -->
      <button 
        @click="goToLogin"
        class="relative group px-10 py-5 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform transition hover:scale-105 active:scale-95"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
        <div class="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
        <div class="relative flex items-center gap-3">
          <span class="text-white font-black text-xl tracking-widest uppercase">START</span>
          <svg class="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </button>

      <!-- Featured Highlights (Optional Decor) -->
      <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-white/5 pt-12">
        <div class="flex flex-col items-center space-y-2 text-slate-400">
          <svg class="w-6 h-6 text-cyan-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="text-sm font-medium">Real-time Sales</span>
        </div>
        <div class="flex flex-col items-center space-y-2 text-slate-400">
          <svg class="w-6 h-6 text-blue-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          <span class="text-sm font-medium">Inventory Tracking</span>
        </div>
        <div class="flex flex-col items-center space-y-2 text-slate-400">
          <svg class="w-6 h-6 text-purple-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span class="text-sm font-medium">Financial Analytics</span>
        </div>
        <div class="flex flex-col items-center space-y-2 text-slate-400">
          <svg class="w-6 h-6 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span class="text-sm font-medium">Secure Access</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Any specific scopes */
</style>
