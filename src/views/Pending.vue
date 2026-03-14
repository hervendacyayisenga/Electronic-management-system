<script setup>
import { onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'

// Access the global product store
const store = useProductStore()

// Ensure data is loaded from localStorage when the component mounts
onMounted(() => store.loadProducts())

// Utility function to format RWF currency
function rwf(n) { return 'RWF ' + Number(n).toLocaleString() }

// Move product from "Pending" to "Sold" category by marking it paid
async function markPaid(id) { await store.payProduct(id) }

// Remove product from database entirely
async function deleteProduct(id) {
  if (confirm('Delete this product?')) await store.deleteProduct(id)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-blue-600 px-6 py-4 shadow">
      <h1 class="text-white font-bold text-xl">Pending Products</h1>
      <p class="text-blue-200 text-sm">Items awaiting payment / sale</p>
    </header>
    <div class="p-6 max-w-7xl mx-auto">
      <div v-if="store.pendingProducts.length === 0"
        class="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow text-slate-400 border border-gray-100">
        <div class="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-3">
          <svg class="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-slate-500">No pending products 🎉</p>
      </div>

      <div v-else class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 bg-gray-50 border-b border-gray-100">
              <th class="px-5 py-3 font-medium">Image</th>
              <th class="px-5 py-3 font-medium">Name</th>
              <th class="px-5 py-3 font-medium">Description</th>
              <th class="px-5 py-3 font-medium">Qty</th>
              <th class="px-5 py-3 font-medium">Price (RWF)</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="product in store.pendingProducts" :key="product.id" class="hover:bg-gray-50 transition">
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
              <td class="px-5 py-3 text-slate-500 max-w-[180px]">{{ product.description || '—' }}</td>
              <td class="px-5 py-3 text-slate-600">{{ product.quantity }}</td>
              <td class="px-5 py-3 font-medium text-slate-700">{{ rwf(product.price) }}</td>
              <td class="px-5 py-3">
                <span class="bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-semibold">⏳ Pending</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button @click="markPaid(product.id)" title="Mark as Sold"
                    class="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                  <button @click="deleteProduct(product.id)" title="Delete"
                    class="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
