<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'

const store = useProductStore()
onMounted(() => store.loadProducts())

// 18% VAT
const VAT_RATE = 0.18

function rwf(n) { return 'RWF ' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }

const subtotal = computed(() => store.totalMoney)
const vatAmount = computed(() => subtotal.value * VAT_RATE)
const totalWithVat = computed(() => subtotal.value + vatAmount.value)

</script>

<template>
  <div class="p-8 bg-[#0f172a] min-h-screen">
    <div class="mb-8 flex justify-between items-center bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-slate-700/50">
      <div>
        <h1 class="text-3xl font-extrabold text-white tracking-wide">Financial Overview</h1>
        <p class="text-slate-400 mt-2">View real-time revenue, VAT calculations, and total business earnings.</p>
      </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Subtotal Card -->
      <div class="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
        <div class="flex items-center gap-4 mb-4 relative z-10">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-400 font-medium text-sm uppercase tracking-wider">Subtotal Revenue</p>
            <p class="text-2xl font-bold text-white">{{ rwf(subtotal) }}</p>
          </div>
        </div>
        <div class="relative z-10 border-t border-slate-700/50 pt-4 mt-2">
          <p class="text-sm text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Net amount before taxes.
          </p>
        </div>
      </div>

      <!-- VAT Card -->
      <div class="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
        <div class="flex items-center gap-4 mb-4 relative z-10">
          <div class="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
            <svg class="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-400 font-medium text-sm uppercase tracking-wider">VAT (18%)</p>
            <p class="text-2xl font-bold text-amber-400">{{ rwf(vatAmount) }}</p>
          </div>
        </div>
        <div class="relative z-10 border-t border-slate-700/50 pt-4 mt-2">
          <p class="text-sm text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tax amount to be collected.
          </p>
        </div>
      </div>

      <!-- Gross Revenue Card -->
      <div class="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
        <div class="flex items-center gap-4 mb-4 relative z-10">
          <div class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p class="text-slate-400 font-medium text-sm uppercase tracking-wider">Gross Revenue</p>
            <p class="text-2xl font-bold text-emerald-400">{{ rwf(totalWithVat) }}</p>
          </div>
        </div>
        <div class="relative z-10 border-t border-slate-700/50 pt-4 mt-2">
          <p class="text-sm text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Total revenue including VAT.
          </p>
        </div>
      </div>
    </div>

    <!-- Details Section -->
    <div class="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-700/50 bg-[#0f172a]/80">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Calculation Details
        </h3>
      </div>
      <div class="p-6">
        <div class="space-y-4 max-w-2xl">
          <div class="flex justify-between items-center py-3 border-b border-slate-800/50">
            <span class="text-slate-400 font-medium">Subtotal (Net Revenue without VAT)</span>
            <span class="font-bold text-slate-200">{{ rwf(subtotal) }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-slate-800/50">
            <span class="text-slate-400 font-medium">VAT Value (18%)</span>
            <span class="font-bold text-amber-400">+ {{ rwf(vatAmount) }}</span>
          </div>
          <div class="flex justify-between items-center py-4 mt-2 bg-slate-800/30 rounded-lg px-4 border border-slate-700/50">
            <span class="text-slate-200 font-bold text-lg">Total Gross Revenue</span>
            <span class="font-extrabold text-emerald-400 text-xl">{{ rwf(totalWithVat) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
