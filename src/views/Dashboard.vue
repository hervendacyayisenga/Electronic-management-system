<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'
import html2pdf from 'html2pdf.js'

// Connect to global stores
const router = useRouter()
const store = useProductStore()
const authStore = useAuthStore()

// Logout and redirect to login page
function logout() {
  authStore.logout()
  router.push({ name: 'SignIn' })
}

// Load inventory from localStorage when the dashboard opens
onMounted(() => store.loadProducts())

// Local UI state for the Add/Edit Product modal
const showModal = ref(false)
const editingProduct = ref(null) // Holds the product being edited, or null if adding a new one
const form = ref({ name: '', description: '', price: '', quantity: '', image: '', paid: false })
const imagePreview = ref('')

// Utility function to format numbers as Rwandan Francs
function rwf(n) {
  return 'RWF ' + Number(n).toLocaleString()
}

// Table Filter Logic
const activeFilter = ref('all') // 'all', 'pending', 'sold'

const filteredProducts = computed(() => {
  if (activeFilter.value === 'pending') return store.pendingProducts
  if (activeFilter.value === 'sold') return store.successfulProducts
  return store.products
})

// Prepare the modal for adding a new product (clears previous data)
function openAdd() {
  editingProduct.value = null
  form.value = { name: '', description: '', price: '', quantity: '', image: '', paid: false }
  imagePreview.value = ''
  showModal.value = true
}

// Prepare the modal for editing an existing product (populates data)
function openEdit(product) {
  editingProduct.value = product
  form.value = {
    name: product.name,
    description: product.description || '',
    price: product.price,
    quantity: product.quantity,
    image: product.image || '',
    paid: product.paid
  }
  imagePreview.value = product.image || '' // Load the existing image into the preview thumbnail
  showModal.value = true
}

// Safely close and reset the modal
function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

// Handle file uploads for product images by converting them to a base64 Data URL
function onImageChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    imagePreview.value = ev.target.result
    form.value.image = ev.target.result // Store the base64 string
  }
  reader.readAsDataURL(file)
}

// Handle the modal's save button click
async function submitForm() {
  if (!form.value.name || !form.value.price || !form.value.quantity) return // Basic validation
  
  if (editingProduct.value) {
    // If we're editing an existing product, pass the updated data to the store
    await store.updateProduct({ ...editingProduct.value, ...form.value })
  } else {
    // Otherwise, it's a completely new product
    await store.addProduct({ ...form.value })
  }
  closeModal()
}

// Remove the item from inventory completely
async function deleteProduct(id) {
  if (confirm('Delete this product?')) await store.deleteProduct(id)
}

// Mark an item as sold (switches its category)
async function markPaid(id) {
  await store.payProduct(id)
}

// Generate PDF receipt for a sold item
async function printReceipt(product) {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="text-align: center; color: #2563eb; margin-bottom: 5px;">Electronic Store</h2>
      <p style="text-align: center; font-size: 12px; color: #666; margin-top: 0; margin-bottom: 20px;">Receipt of Purchase</p>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Receipt No:</strong> #${product.id}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="text-align: left; padding: 8px 0;">Item</th>
            <th style="text-align: center; padding: 8px 0;">Qty</th>
            <th style="text-align: right; padding: 8px 0;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 0;">${product.name}</td>
            <td style="text-align: center; padding: 12px 0;">${product.quantity}</td>
            <td style="text-align: right; padding: 12px 0;">${rwf(product.price)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="text-align: right; padding: 12px 0; font-weight: bold;">Total Paid:</td>
            <td style="text-align: right; padding: 12px 0; font-weight: bold; color: #16a34a;">
              ${rwf(Number(product.price) * Number(product.quantity))}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; margin-top: 40px; font-size: 14px; color: #666;">
        <p>Thank you for your business!</p>
      </div>
    </div>
  `;

  const opt = {
    margin: 1,
    filename: `receipt_${product.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
</script>

<template>
  <div class="min-h-screen" style="background:#022c22;">
    <!-- Dark Green top bar text-emerald-100 -->
    <header class="px-6 py-4 flex items-center justify-between shadow border-b border-emerald-800/50" style="background:linear-gradient(135deg,#064e3b,#047857);">
      <h1 class="text-white font-bold text-xl">{{ authStore.isSuperAdmin ? 'Admin Control' : 'Manager Dashboard' }}</h1>
      <div class="flex items-center gap-4 text-white">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shadow">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <span class="text-sm font-medium">{{ authStore.user?.name }}</span>
          <span class="text-emerald-200/80 text-xs bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
            {{ authStore.isSuperAdmin ? 'Admin' : 'Manager' }}
          </span>
        </div>
        <button @click="logout" aria-label="Logout" class="flex items-center gap-1.5 text-sm font-medium text-emerald-200 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>

    <!-- Manager Unapproved Notice -->
    <div v-if="authStore.isManager && !authStore.user?.approved" class="bg-orange-500 text-white px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      Your Product Manager account is awaiting Admin approval. You cannot add or edit items until approved.
    </div>

    <div class="p-6 max-w-7xl mx-auto">
      <!-- Stat Cards -->
      <div class="flex gap-4 mb-6">
        <!-- Pending (50% width) -->
        <div class="flex-1 rounded-xl p-5 flex items-center gap-4 text-white shadow"
          style="background: linear-gradient(135deg,#f97316,#ea580c)">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-white/80 text-sm font-medium">Pending Products</p>
            <p class="text-3xl font-bold">{{ store.pendingProducts.length }}</p>
          </div>
        </div>

        <!-- Successful (50% width) -->
        <div class="flex-1 rounded-xl p-5 flex items-center gap-4 text-white shadow"
          style="background: linear-gradient(135deg,#22c55e,#16a34a)">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-white/80 text-sm font-medium">Successful Payments</p>
            <p class="text-3xl font-bold">{{ store.successfulProducts.length }}</p>
          </div>
        </div>

        <!-- Total Money (SuperAdmin only) -->
        <div v-if="authStore.isSuperAdmin" class="flex-1 rounded-xl p-5 flex items-center gap-4 shadow bg-emerald-900/40 border border-emerald-800/50">
          <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-emerald-100/70 text-sm font-medium">Total Revenue</p>
            <p class="text-lg font-bold text-white">{{ rwf(store.totalMoney) }}</p>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-emerald-900/40 rounded-xl shadow overflow-hidden border border-emerald-800/50">
        <div class="flex items-center justify-between px-6 py-4 border-b border-emerald-800/50">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="font-bold text-white text-base">Products</h2>
              <div class="flex bg-black/20 p-1 rounded-lg border border-white/5">
                <button @click="activeFilter = 'all'" :class="activeFilter === 'all' ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-100/70 hover:text-white'" class="px-3 py-1 text-xs font-semibold rounded-md transition-all">All</button>
                <button @click="activeFilter = 'pending'" :class="activeFilter === 'pending' ? 'bg-orange-600 text-white shadow-sm' : 'text-emerald-100/70 hover:text-white'" class="px-3 py-1 text-xs font-semibold rounded-md transition-all">Pending</button>
                <button @click="activeFilter = 'sold'" :class="activeFilter === 'sold' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-100/70 hover:text-white'" class="px-3 py-1 text-xs font-semibold rounded-md transition-all">Sold</button>
              </div>
            </div>
            <p class="text-emerald-500/80 text-xs mt-1">{{ filteredProducts.length }} items shown</p>
          </div>
          <button @click="openAdd"
            :disabled="authStore.isManager && !authStore.user?.approved"
            class="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow disabled:opacity-50 disabled:shadow-none">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Item
          </button>
        </div>

        <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
          <p class="text-sm">No products found for this filter.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-emerald-100/70 bg-black/10 border-b border-emerald-800/50">
                <th class="px-5 py-3 font-medium">Image</th>
                <th class="px-5 py-3 font-medium">Name</th>
                <th class="px-5 py-3 font-medium">Description</th>
                <th class="px-5 py-3 font-medium">Quantity</th>
                <th class="px-5 py-3 font-medium">Price</th>
                <th class="px-5 py-3 font-medium">Status</th>
                <th class="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-emerald-800/50">
              <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-white/5 transition">
                <td class="px-5 py-3">
                  <div class="w-12 h-12 rounded-lg bg-black/20 overflow-hidden border border-emerald-800/50 flex items-center justify-center">
                    <img :src="product.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800'" class="w-full h-full object-cover" :alt="product.name || 'Electronic item'"/>
                  </div>
                </td>
                <td class="px-5 py-3 font-semibold text-white">{{ product.name }}</td>
                <td class="px-5 py-3 text-emerald-100/70 max-w-[200px]">
                  <span class="line-clamp-2">{{ product.description || '—' }}</span>
                </td>
                <td class="px-5 py-3 text-emerald-500/80">{{ product.quantity }}</td>
                <td class="px-5 py-3 font-medium text-white">{{ rwf(product.price) }}</td>
                <td class="px-5 py-3">
                  <span v-if="product.outOfStock"
                    class="bg-red-100 text-red-700 border border-red-300 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    🚫 Out of Stock
                  </span>
                  <span v-else-if="product.paid"
                    class="bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    ✓ Sold
                  </span>
                  <span v-else
                    class="bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    ⏳ Pending
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="!product.paid" @click="markPaid(product.id)" title="Mark as Sold"
                      class="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </button>
                    <button v-if="product.paid" @click="printReceipt(product)" title="Print Receipt"
                      class="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                      </svg>
                    </button>
                    <button @click="openEdit(product)" title="Edit"
                      :disabled="authStore.isManager && !authStore.user?.approved"
                      class="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-gray-200 disabled:hover:bg-transparent">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button @click="deleteProduct(product.id)" title="Delete"
                      :disabled="authStore.isManager && !authStore.user?.approved"
                      class="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-gray-200 disabled:hover:bg-transparent">
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

      <!-- Revenue Summary Table (SuperAdmin ONLY) -->
      <div v-if="authStore.isSuperAdmin" class="mt-8 bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 class="font-bold text-slate-700 text-base">Revenue Summary</h2>
            <p class="text-slate-400 text-xs mt-0.5">Details of sold items</p>
          </div>
        </div>

        <div v-if="store.successfulProducts.length === 0" class="flex flex-col items-center justify-center py-8 text-slate-400">
          <p class="text-sm">No items sold yet.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 bg-gray-50 border-b border-gray-100">
                <th class="px-6 py-3 font-medium">Item Code/ID</th>
                <th class="px-6 py-3 font-medium">Name</th>
                <th class="px-6 py-3 font-medium">Unit Price</th>
                <th class="px-6 py-3 font-medium text-center">Qty Sold</th>
                <th class="px-6 py-3 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="product in store.successfulProducts" :key="product.id" class="hover:bg-gray-50/50 transition">
                <td class="px-6 py-3 text-slate-500 text-xs font-mono">#{{ product.id }}</td>
                <td class="px-6 py-3 font-medium text-slate-700">{{ product.name }}</td>
                <td class="px-6 py-3 text-slate-600">{{ rwf(product.price) }}</td>
                <td class="px-6 py-3 text-center font-medium text-slate-700">{{ product.quantity }}</td>
                <td class="px-6 py-3 text-right font-medium text-green-600">
                  {{ rwf(Number(product.price) * Number(product.quantity)) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 text-slate-700 border-t border-gray-200">
              <tr>
                <td colspan="4" class="px-6 py-4 text-right font-bold text-base">Total Revenue:</td>
                <td class="px-6 py-4 text-right font-bold text-lg text-green-600">{{ rwf(store.totalMoney) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="font-bold text-slate-700">{{ editingProduct ? 'Edit Product' : 'Add Electronic Item' }}</h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="submitForm" class="p-6 space-y-4">
            <!-- Image -->
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1.5">Product Image</label>
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" alt=""/>
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <label class="flex-1 cursor-pointer border border-dashed border-gray-300 hover:border-blue-400 rounded-xl text-center py-3 text-sm text-gray-400 hover:text-blue-500 transition">
                  Upload image
                  <input type="file" accept="image/*" class="hidden" @change="onImageChange"/>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1.5">Product Name</label>
              <input v-model="form.name" required placeholder="e.g. Samsung Smart TV" type="text"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
              <textarea v-model="form.description" rows="2" placeholder="Short product description…"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1.5">Price (RWF)</label>
                <input v-model="form.price" type="number" min="0" step="100" required placeholder="e.g. 185000"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1.5">Quantity</label>
                <input v-model="form.quantity" type="number" min="1" required placeholder="1"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            <!-- Status toggle -->
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium text-slate-600">Status:</label>
              <button type="button" @click="form.paid = !form.paid"
                :class="form.paid ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'"
                class="px-4 py-1.5 rounded-full text-xs font-semibold transition">
                {{ form.paid ? '✓ Sold' : '⏳ Pending' }}
              </button>
            </div>

            <div class="flex gap-3 pt-1">
              <button type="button" @click="closeModal"
                class="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 text-sm font-medium transition">
                Cancel
              </button>
              <button type="submit"
                class="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow">
                {{ editingProduct ? 'Save Changes' : 'Add Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
