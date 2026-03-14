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
  <article class="bg-white rounded-xl shadow border border-blue-50 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200" aria-label="Product Card">
    <!-- Image -->
    <div class="h-48 flex items-center justify-center overflow-hidden relative group"
      style="background:linear-gradient(135deg,#eff6ff,#e0f2fe)">
      <img v-if="product.image" :src="product.image" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        :alt="product.name"/>
      <div v-else class="flex flex-col items-center gap-2">
        <svg class="w-14 h-14 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <span class="text-[10px] text-blue-300 font-medium tracking-wider uppercase">No Image</span>
      </div>
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <div class="p-4">
      <span class="bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full font-semibold">✓ Available</span>
      <h3 class="font-bold text-slate-700 truncate text-sm mt-2">{{ product.name }}</h3>
      <p class="text-slate-400 text-xs mt-0.5 line-clamp-2">{{ product.description || 'No description' }}</p>

      <div class="flex items-center justify-between mt-3">
        <div>
          <p class="text-blue-700 font-extrabold text-base">{{ rwf(product.price) }}</p>
          <p class="text-slate-400 text-xs">{{ product.quantity }} in stock</p>
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
