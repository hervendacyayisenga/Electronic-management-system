<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push({ name: 'SignIn' })
}

const adminNavItems = [
  {
    name: 'Dashboard',
    to: { name: 'Dashboard' },
    label: 'Dashboard',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>`
  },
  {
    name: 'Pending',
    to: { name: 'Pending' },
    label: 'Pending',
    dot: 'orange'
  },
  {
    name: 'Successful',
    to: { name: 'Successful' },
    label: 'Successful',
    dot: 'green'
  }
]
</script>

<template>
  <aside class="fixed top-0 left-0 h-screen w-48 bg-blue-700 flex flex-col z-40 shadow-xl">
    <!-- Brand -->
    <div class="flex items-center gap-2 px-5 py-5 bg-blue-800">
      <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
      <span class="text-white font-bold text-sm leading-tight">EMS</span>
    </div>

    <!-- Dashboard label (header item) -->
    <div class="flex items-center gap-2 px-5 py-4 border-b border-blue-600">
      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
      <span class="text-white font-bold text-sm">Dashboard</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 space-y-1 px-3">
      <router-link
        v-for="item in adminNavItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="route.name === item.name
          ? 'bg-white/20 text-white'
          : 'text-blue-200 hover:bg-white/10 hover:text-white'"
      >
        <!-- Dot indicators -->
        <span v-if="item.dot === 'orange'" class="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0"/>
        <span v-else-if="item.dot === 'green'" class="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 flex items-center justify-center">
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
            <path d="M6.41 1L3 4.41 1.59 3 0 4.59l3 3L8 2.59z"/>
          </svg>
        </span>
        <svg v-if="item.icon" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-html="item.icon"/>
        {{ item.label }}
      </router-link>

      <!-- Total Money link -->
      <router-link
        :to="{ name: 'Successful' }"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-blue-200 hover:bg-white/10 hover:text-white"
      >
        <span class="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 flex items-center justify-center">
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
            <path d="M6.41 1L3 4.41 1.59 3 0 4.59l3 3L8 2.59z"/>
          </svg>
        </span>
        Total Money
      </router-link>
    </nav>

    <!-- User info + Logout -->
    <div class="border-t border-blue-600 p-3">
      <div class="px-2 pb-2">
        <p class="text-blue-200 text-xs truncate">{{ authStore.user?.name }}</p>
        <p class="text-blue-300/60 text-xs truncate">{{ authStore.user?.role }}</p>
      </div>
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-red-500/20 hover:text-red-300 text-sm font-medium transition"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
        </svg>
        Logout
      </button>
    </div>
  </aside>
</template>
