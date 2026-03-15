<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'
import ProductCard from '../components/ProductCard.vue'

// Establish router access for logging out
const router = useRouter()

// Connect to global data stores
const store = useProductStore()
const authStore = useAuthStore()
onMounted(() => store.loadProducts())

// Local state for the search bar
const search = ref('')

// Payment modal state management
const showPayModal = ref(false)
const selectedProduct = ref(null)
const momoPhone = ref('')
const phoneError = ref('')
const payStep = ref('form')   // Steps: 'form' | 'processing' | 'success'

function rwf(n) { return 'RWF ' + Number(n).toLocaleString() }

// Computed property that automatically filters the store inventory
// It only shows products that are NOT out of stock AND match the search input query
const available = computed(() =>
  store.products.filter(p =>
    !p.outOfStock &&
    (p.name.toLowerCase().includes(search.value.toLowerCase()) ||
     (p.description || '').toLowerCase().includes(search.value.toLowerCase()))
  )
)

// Start the checkout flow when a Buy button is clicked
function openBuy(product) {
  selectedProduct.value = product
  momoPhone.value = ''
  phoneError.value = ''
  payStep.value = 'form'
  showPayModal.value = true
}

// Safely close the modal (blocked if transaction is actively processing)
function closeModal() {
  if (payStep.value === 'processing') return
  showPayModal.value = false
  selectedProduct.value = null
}

// Handle the mock Mobile Money (MoMo) transaction
async function handlePay() {
  phoneError.value = ''
  
  // Basic Regex validation for a Rwandan phone number
  if (!/^(07[2389])\d{7}$/.test(momoPhone.value.replace(/\s/g, ''))) {
    phoneError.value = 'Enter a valid MTN/Airtel Rwanda number (e.g. 0781234567)'
    return
  }
  
  // Transition UI to spinning loader
  payStep.value = 'processing'
  
  // Simulate network request delay (2.2 seconds)
  await new Promise(r => setTimeout(r, 2200))
  
  // Transaction is complete: Tell store to mark product as out-of-stock / paid
  await store.markOutOfStock(selectedProduct.value.id)
  
  // Transition UI to the success receipt screen
  payStep.value = 'success'
}

// Logout and redirect to login page
function logout() {
  authStore.logout()
  router.push({ name: 'SignIn' })
}
</script>

<template>
  <div class="min-h-screen" style="background:#022c22;">
    <!-- Header -->
    <header class="px-6 py-4 flex items-center justify-between shadow sticky top-0 z-30 border-b border-emerald-800/50"
      style="background:linear-gradient(135deg,#064e3b,#047857);">
      <div class="flex items-center gap-3">
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z"/>
        </svg>
        <div>
          <h1 class="text-white font-bold text-lg leading-tight">EMS Shop</h1>
          <p class="text-emerald-200 text-xs">Electronic Management System</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-emerald-900 text-sm">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="hidden sm:block">
            <p class="text-white text-xs font-medium leading-tight">{{ authStore.user?.name }}</p>
            <p class="text-emerald-200 text-xs shadow-sm bg-black/10 px-2 rounded-full mt-0.5">Customer</p>
          </div>
        </div>
        <button @click="logout" class="text-white/70 hover:text-white text-sm flex items-center gap-1 transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>

    <!-- Welcome bar -->
    <div class="bg-emerald-900/40 border-b border-emerald-800/50 px-6 py-3 flex items-center justify-between">
      <p class="text-emerald-100/70 text-sm">
        Welcome, <span class="font-semibold text-white">{{ authStore.user?.name }}</span>!
        <span class="text-emerald-500/80 ml-1">{{ available.length }} product{{ available.length !== 1 ? 's' : '' }} available</span>
      </p>
    </div>

    <main class="p-6 max-w-7xl mx-auto">
      <!-- Search -->
      <div class="relative mb-6">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Search electronics…" aria-label="Search electronics"
          class="w-full pl-9 pr-4 py-3 bg-emerald-900/30 border border-emerald-500/20 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-50 placeholder-emerald-100/40 transition"/>
      </div>

      <!-- Empty state -->
      <div v-if="available.length === 0"
        class="flex flex-col items-center justify-center py-16 bg-emerald-900/20 rounded-xl shadow text-emerald-500/50 border border-emerald-800/30">
        <svg class="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <p class="text-sm">No electronics available right now.</p>
      </div>

      <!-- Product Grid -->
      <section v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-label="Available Products">
        <ProductCard 
          v-for="product in available" 
          :key="product.id" 
          :product="product"
          @buy="openBuy"
        />
      </section>
    </main>

    <!-- ===== PAYMENT MODAL ===== -->
    <transition name="fade">
      <div v-if="showPayModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

          <!-- FORM step -->
          <template v-if="payStep === 'form'">
            <!-- Modal header -->
            <div class="px-6 py-4 flex items-center justify-between"
              style="background:linear-gradient(135deg,#f97316,#ef4444);">
              <div>
                <h3 id="modal-title" class="text-white font-bold text-base">Complete Purchase</h3>
                <p class="text-orange-100 text-xs">Pay via Mobile Money</p>
              </div>
              <button @click="closeModal" aria-label="Close modal" class="text-white/80 hover:text-white">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <!-- Product summary -->
              <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <div class="w-12 h-12 rounded-lg bg-orange-100 border border-orange-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img :src="selectedProduct?.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800'" class="w-full h-full object-cover" alt="Product"/>
                </div>
                <div>
                  <p class="font-semibold text-slate-700 text-sm">{{ selectedProduct?.name }}</p>
                  <p class="text-orange-600 font-bold text-base">{{ rwf(selectedProduct?.price) }}</p>
                </div>
              </div>

              <!-- MoMo logo & label -->
              <div class="flex items-center gap-2 mb-1">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-xs shadow" style="background:#f9c200;">
                  MoMo
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-700">MTN Mobile Money</p>
                  <p class="text-slate-400 text-xs">Enter your MoMo phone number</p>
                </div>
              </div>

              <!-- Phone input -->
              <div>
                <label for="momoPhone" class="block text-xs font-medium text-slate-600 mb-1.5">Phone Number</label>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1 px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-slate-600 font-medium flex-shrink-0">
                    🇷🇼 +250
                  </div>
                  <input id="momoPhone" v-model="momoPhone" type="tel" placeholder="078 123 4567"
                    class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                </div>
                <p v-if="phoneError" class="text-red-500 text-xs mt-1.5">{{ phoneError }}</p>
                <p class="text-slate-400 text-xs mt-1">Supported: MTN (078/079), Airtel (072/073)</p>
              </div>

              <!-- Amount summary -->
              <div class="flex justify-between items-center py-3 border-t border-dashed border-gray-200">
                <span class="text-slate-500 text-sm">Amount to pay</span>
                <span class="font-extrabold text-orange-600 text-lg">{{ rwf(selectedProduct?.price) }}</span>
              </div>

              <!-- Pay button -->
              <button @click="handlePay"
                class="w-full py-3 rounded-xl font-bold text-white text-sm transition shadow-lg hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                style="background:linear-gradient(135deg,#f97316,#ef4444);">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Pay Now
              </button>
            </div>
          </template>

          <!-- PROCESSING step -->
          <template v-else-if="payStep === 'processing'">
            <div class="flex flex-col items-center justify-center py-14 px-6 text-center" aria-live="polite">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg" style="background:#f9c200;">
                <span class="font-extrabold text-white text-sm">MoMo</span>
              </div>
              <svg class="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p class="font-bold text-slate-700">Processing Payment…</p>
              <p class="text-slate-400 text-sm mt-1">Check your phone for the MoMo prompt</p>
              <p class="text-slate-400 text-xs mt-1">{{ momoPhone }}</p>
            </div>
          </template>

          <!-- SUCCESS step -->
          <template v-else-if="payStep === 'success'">
            <div class="flex flex-col items-center justify-center py-12 px-6 text-center" aria-live="polite">
              <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-lg">
                <svg class="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 class="text-green-600 font-extrabold text-xl mb-1">Payment Successful!</h3>
              <p class="text-slate-600 text-sm font-medium">{{ selectedProduct?.name }}</p>
              <p class="text-orange-600 font-bold text-lg mt-0.5">{{ rwf(selectedProduct?.price) }}</p>
              <p class="text-slate-400 text-xs mt-2">Paid via MoMo · {{ momoPhone }}</p>

              <!-- Out of stock notice -->
              <div class="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 w-full">
                <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <p class="text-red-600 text-xs font-semibold">This item is now Out of Stock</p>
              </div>

              <button @click="closeModal"
                class="mt-5 w-full py-2.5 rounded-xl font-bold text-white text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                style="background:linear-gradient(135deg,#1e40af,#0891b2);">
                Continue Shopping
              </button>
            </div>
          </template>

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
