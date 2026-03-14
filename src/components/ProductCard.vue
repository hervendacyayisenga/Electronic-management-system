<script setup>
import { defineProps, defineEmits } from 'vue'

// Expects a 'product' object to be passed in from the parent component
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// Declares that this component can emit a 'buy' event back up to the parent
const emit = defineEmits(['buy'])

// Local utility for formatting currency (Rwandan Francs)
function rwf(n) {
  return 'RWF ' + Number(n).toLocaleString()
}
</script>

<template>
  <article class="bg-emerald-900/40 rounded-xl shadow border border-emerald-800/50 overflow-hidden hover:shadow-lg hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200" aria-label="Product Card">
    <!-- Image -->
    <div class="h-48 flex items-center justify-center overflow-hidden relative group"
      style="background:linear-gradient(135deg,#064e3b,#022c22)">
      <img :src="product.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800'" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        :alt="product.name || 'Electronic device'"/>
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <div class="p-4">
      <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-semibold">✓ Available</span>
      <h3 class="font-bold text-white truncate text-sm mt-2">{{ product.name }}</h3>
      <p class="text-emerald-100/60 text-xs mt-0.5 line-clamp-2">{{ product.description || 'No description' }}</p>

      <div class="flex items-center justify-between mt-3">
        <div>
          <p class="text-emerald-400 font-extrabold text-base">{{ rwf(product.price) }}</p>
          <p class="text-emerald-500/80 text-xs">{{ product.quantity }} in stock</p>
        </div>
        <!-- BUY button -->
        <button @click="emit('buy', product)"
          :aria-label="'Buy ' + product.name"
          class="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-bold transition shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400"
          style="background:linear-gradient(135deg,#f97316,#ef4444);">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z"/>
          </svg>
          Buy
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.line-clamp-2 { 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  line-clamp: 2;
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}
</style>
