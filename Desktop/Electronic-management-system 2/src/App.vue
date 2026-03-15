<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/Sidebar.vue'
import { playClickSound, playFocusSound, triggerVibration, speakText } from './utils/audioUtils'

// Access the global authentication store to check the current user's role
const authStore = useAuthStore()

// Computed property to conditionally show the sidebar only if the user is an admin
const showSidebar = computed(() => authStore.isAdmin)

// Helper function to extract accessible text for screen readers/voice features
function getAccessibleName(el) {
  // Try aria-label first, then visible text content
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  
  const text = el.innerText || el.textContent;
  return text ? text.trim() : '';
}

// Global click handler to provide audio and haptic feedback
const handleGlobalClick = (e) => {
  // Play sound/vibrate/speak if a button or an anchor (link) is clicked
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

// Global focus handler to provide feedback when navigating with the keyboard (e.g., Tab key)
const handleGlobalFocus = (e) => {
  // Play sound/speak if an interactive element receives focus
  if (e.target && e.target.closest) {
    const el = e.target.closest('button, [role="button"], a, input, select, textarea');
    if (el) {
      playFocusSound();
      triggerVibration(15); // gentle tick for focus changes
      
      const name = getAccessibleName(el);
      if (name) {
        speakText(name);
      } else if (el.placeholder) {
        speakText(el.placeholder); // Read placeholder text for empty inputs
      }
    }
  }
};

// Attach global event listeners when the root component mounts
onMounted(() => {
  document.addEventListener('click', handleGlobalClick, { capture: true });
  document.addEventListener('focusin', handleGlobalFocus, { capture: true });
});

// Clean up event listeners to prevent memory leaks if the component unmounts
onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, { capture: true });
  document.removeEventListener('focusin', handleGlobalFocus, { capture: true });
});
</script>

<template>
  <!-- Main layout container: Dark background and white text for the entire app -->
  <div class="min-h-screen flex bg-[#0f172a] text-slate-200">
    
    <!-- Admin sidebar: Only rendered if showSidebar (authStore.isAdmin) is true -->
    <Sidebar v-if="showSidebar" />

    <!-- Main content area -->
    <!-- Applies margin-left (ml-48) to make room for the fixed sidebar if it is visible -->
    <main :class="showSidebar ? 'flex-1 ml-48 min-h-screen relative overflow-x-hidden' : 'flex-1 min-h-screen relative overflow-x-hidden'">
      
      <!-- Vue Router injects the current page component based on the URL here -->
      <router-view v-slot="{ Component }">
        <!-- Wraps the routed component in a transition for smooth page changes -->
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
