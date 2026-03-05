<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/Sidebar.vue'
import { playClickSound, playFocusSound, triggerVibration, speakText } from './utils/audioUtils'

const authStore = useAuthStore()
const showSidebar = computed(() => authStore.isAdmin)

function getAccessibleName(el) {
  // Try aria-label first, then visible text content
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  
  const text = el.innerText || el.textContent;
  return text ? text.trim() : '';
}

const handleGlobalClick = (e) => {
  // Play sound/vibrate/speak if a button or an anchor is clicked
  const el = e.target.closest?.('button, [role="button"], a');
  if (el) {
    playClickSound();
    triggerVibration(40); // 40ms light vibration
    
    // Read the button text aloud when clicked to confirm action
    const name = getAccessibleName(el);
    if (name) {
      speakText(`${name} selected`);
    }
  }
};

const handleGlobalFocus = (e) => {
  // Play sound/speak if an interactive element receives focus (e.g., via Tab key)
  if (e.target && e.target.closest) {
    const el = e.target.closest('button, [role="button"], a, input, select, textarea');
    if (el) {
      playFocusSound();
      triggerVibration(15); // gentle tick for focus changes
      
      const name = getAccessibleName(el);
      if (name) {
        speakText(name);
      } else if (el.placeholder) {
        speakText(el.placeholder);
      }
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClick, { capture: true });
  document.addEventListener('focusin', handleGlobalFocus, { capture: true });
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, { capture: true });
  document.removeEventListener('focusin', handleGlobalFocus, { capture: true });
});
</script>

<template>
  <div class="min-h-screen flex bg-[#0f172a] text-slate-200">
    <!-- Admin sidebar -->
    <Sidebar v-if="showSidebar" />

    <!-- Main content -->
    <main :class="showSidebar ? 'flex-1 ml-48 min-h-screen relative overflow-x-hidden' : 'flex-1 min-h-screen relative overflow-x-hidden'">
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
