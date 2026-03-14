<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'

// Connect to global products state
const store = useProductStore()

// Bootstrap inventory data
onMounted(() => store.loadProducts())

// Formats a number consistently into RWF text format
function rwf(n) { return 'RWF ' + Number(n).toLocaleString() }

// Use a computed property so the total updates reactively whenever a new sale is made
const totalRevenue = computed(() => rwf(store.totalMoney))
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-blue-600 px-6 py-4 shadow flex items-center justify-between">
      <div>
        <h1 class="text-white font-bold text-xl">Successful Payments</h1>
        <p class="text-blue-200 text-sm">Sold products & collected revenue</p>
      </div>
      <div class="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-white font-bold text-sm">Total: {{ totalRevenue }}</span>
      </div>
    </header>

    <div class="p-6 max-w-7xl mx-auto">
      <div v-if="store.successfulProducts.length === 0"
        class="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow text-slate-400 border border-gray-100">
        <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-slate-500">No sold products yet</p>
      </div>

      <div v-else class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 bg-gray-50 border-b border-gray-100">
              <th class="px-5 py-3 font-medium">Image</th>
              <th class="px-5 py-3 font-medium">Name</th>
              <th class="px-5 py-3 font-medium">Description</th>
              <th class="px-5 py-3 font-medium">Qty</th>
              <th class="px-5 py-3 font-medium">Unit Price</th>
              <th class="px-5 py-3 font-medium">Revenue</th>
              <th class="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="product in store.successfulProducts" :key="product.id" class="hover:bg-gray-50 transition">
              <td class="px-5 py-3">
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                  <img v-if="product.image" :src="product.image" class="w-full h-full object-cover" alt=""/>
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </td>
              <td class="px-5 py-3 font-semibold text-slate-700">{{ product.name }}</td>
              <td class="px-5 py-3 text-slate-500">{{ product.description || '—' }}</td>
              <td class="px-5 py-3 text-slate-600">{{ product.quantity }}</td>
              <td class="px-5 py-3 font-medium text-slate-700">{{ rwf(product.price) }}</td>
              <td class="px-5 py-3 font-bold text-green-600">{{ rwf(Number(product.price) * Number(product.quantity)) }}</td>
              <td class="px-5 py-3">
                <span v-if="product.outOfStock"
                  class="bg-red-100 text-red-700 border border-red-300 px-2.5 py-1 rounded-full text-xs font-semibold">🚫 Out of Stock</span>
                <span v-else
                  class="bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">✓ Sold</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
