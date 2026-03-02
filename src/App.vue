<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/Sidebar.vue'

const authStore = useAuthStore()
const showSidebar = computed(() => authStore.isAdmin)
</script>

<template>
  <div class="min-h-screen flex bg-slate-100 text-slate-800">
    <!-- Admin sidebar -->
    <Sidebar v-if="showSidebar" />

    <!-- Main content -->
    <main :class="showSidebar ? 'flex-1 ml-48' : 'flex-1'">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
