<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Connect to global products store
const store = useProductStore()

// Load store data when component mounts
onMounted(() => store.loadProducts())

// 18% VAT (Value Added Tax)
const VAT_RATE = 0.18

// Utility formatters
function rwf(n) { return 'RWF ' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
function getNumber(n) { return Number(n) || 0 }

// Reactive computed properties for dynamic financial calculations
const subtotal = computed(() => store.totalMoney) // Total of all sold items
const vatAmount = computed(() => subtotal.value * VAT_RATE)
const totalWithVat = computed(() => subtotal.value + vatAmount.value)
const totalPending = computed(() => store.pendingProducts.reduce((sum, p) => sum + (getNumber(p.price) * getNumber(p.quantity)), 0))

// Generates a professional multi-table PDF Export of the financial statements
function generatePDF() {
  const doc = new jsPDF()
  
  // Helper to safely truncate descriptions
  const getTruncatedDesc = (desc) => {
    if (!desc) return 'No description provided'
    return desc.length > 50 ? desc.substring(0, 47) + '...' : desc
  }

  // --- Document Header ---
  // Background Box for Header
  doc.setFillColor(6, 78, 59) // Emerald-900
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F')
  
  // Title
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.text('ELECTRONIC MGMT', 14, 18)
  
  // Subtitle
  doc.setFontSize(12)
  doc.setTextColor(209, 250, 229) // Emerald-100
  doc.setFont("helvetica", "normal")
  doc.text('Executive Financial Statement', 14, 26)
  
  // Date/Time
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 14, 26, { align: 'right' })

  let startY = 50

  // --- Sold Products Table ---
  if (store.successfulProducts.length > 0) {
    doc.setFontSize(16)
    doc.setTextColor(6, 95, 70) // Emerald-800
    doc.setFont("helvetica", "bold")
    doc.text('I. Successful Transactions', 14, startY)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.setFont("helvetica", "normal")
    doc.text('Verified Revenue Streams from completed sales.', 14, startY + 6)
    
    doc.autoTable({
      startY: startY + 10,
      head: [['ID', 'Name', 'Description', 'Unit Price', 'Qty', 'Subtotal']],
      body: store.successfulProducts.map(p => [
        `#ID${p.id}`,
        p.name,
        getTruncatedDesc(p.description),
        rwf(p.price),
        p.quantity,
        rwf(getNumber(p.price) * getNumber(p.quantity))
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // Emerald-500
      columnStyles: {
        2: { cellWidth: 50 }, // Give description some room
        5: { halign: 'right', fontStyle: 'bold', textColor: [6, 95, 70] }
      },
      styles: { fontSize: 9 }
    })
    startY = doc.lastAutoTable.finalY + 20
  }
  
  // --- Pending Products Table ---
  if (store.pendingProducts.length > 0) {
    // Check if we need a new page
    if (startY > doc.internal.pageSize.height - 60) {
      doc.addPage()
      startY = 20
    }

    doc.setFontSize(16)
    doc.setTextColor(217, 119, 6) // Amber-600
    doc.setFont("helvetica", "bold")
    doc.text('II. Pending Inventory', 14, startY)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.setFont("helvetica", "normal")
    doc.text('Projected Pipeline. Products awaiting sale/clearance.', 14, startY + 6)
    
    doc.autoTable({
      startY: startY + 10,
      head: [['ID', 'Name', 'Description', 'Current Price', 'Available', 'Potential']],
      body: store.pendingProducts.map(p => [
        `#ID${p.id}`,
        p.name,
        getTruncatedDesc(p.description),
        rwf(p.price),
        p.quantity,
        rwf(getNumber(p.price) * getNumber(p.quantity))
      ]),
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' }, // Amber-500
      columnStyles: {
        2: { cellWidth: 50 },
        5: { halign: 'right', fontStyle: 'bold', textColor: [180, 83, 9] }
      },
      styles: { fontSize: 9 }
    })
    startY = doc.lastAutoTable.finalY + 20
  }

  // --- Financial Summary Box ---
  // Ensure enough room for the summary box at the end
  if (startY > doc.internal.pageSize.height - 70) {
    doc.addPage()
    startY = 20
  }

  // Draw background box for summary
  doc.setDrawColor(209, 250, 229) // Emerald-100
  doc.setFillColor(248, 250, 252) // Slate-50
  doc.roundedRect(14, startY, doc.internal.pageSize.width - 28, 55, 3, 3, 'FD')
  
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42) // Slate-900
  doc.setFont("helvetica", "bold")
  doc.text('III. Consolidated Financial Overview', 20, startY + 10)

  // Layout metrics
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105) // Slate-600
  
  // Left Column (Metrics)
  doc.text('Net Revenue (Successful Sales):', 20, startY + 22)
  doc.text('Tax Provision (VAT @ 18%):', 20, startY + 30)
  doc.text('Projected Pipeline (Pending):', 20, startY + 38)
  
  doc.setFont("helvetica", "bold")
  doc.setTextColor(6, 95, 70)
  doc.text('Gross Liquidity (Net + VAT):', 20, startY + 48)

  // Right Column (Values)
  const rightAlign = doc.internal.pageSize.width - 20
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30)
  
  doc.text(rwf(subtotal.value), rightAlign, startY + 22, { align: 'right' })
  doc.text(rwf(vatAmount.value), rightAlign, startY + 30, { align: 'right' })
  
  doc.setTextColor(217, 119, 6) // Amber for pending
  doc.text(rwf(totalPending.value), rightAlign, startY + 38, { align: 'right' })

  // Total Divider
  doc.setDrawColor(203, 213, 225) // Slate-300
  doc.line(rightAlign - 50, startY + 42, rightAlign, startY + 42)

  doc.setFontSize(12)
  doc.setTextColor(6, 95, 70) // Emerald
  doc.text(rwf(totalWithVat.value), rightAlign, startY + 48, { align: 'right' })

  // --- Footer ---
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' })
    doc.text('Confidential - Generated by Electronic Mgmt System', 14, doc.internal.pageSize.height - 10)
  }

  doc.save(`Financial-Statement-${new Date().getTime()}.pdf`)
}
</script>

<template>
  <div class="p-8 min-h-screen" style="background: linear-gradient(145deg, #022c22, #064e3b, #022c22);">
    <div class="mb-8 flex justify-between items-center bg-[#065f46]/30 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-emerald-500/20">
      <div>
        <h1 class="text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
          <span class="w-2 h-8 bg-emerald-400 rounded-full"></span>
          Financial Intelligence
        </h1>
        <p class="text-emerald-200/60 mt-2 font-medium">Advanced revenue tracking & product performance analytics.</p>
      </div>
      <div class="hidden md:block">
        <div class="text-right flex items-center justify-end gap-6">
          <button @click="generatePDF" class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl transition-colors font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export PDF
          </button>
          <div>
            <p class="text-emerald-400 font-bold text-sm tracking-widest uppercase">Live Status</p>
            <div class="flex items-center gap-2 justify-end mt-1">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span class="text-white text-xs font-mono">SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <!-- Subtotal Card -->
      <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
        <div class="flex items-center gap-4 mb-4 relative z-10">
          <div class="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-400/30 shadow-inner">
            <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-emerald-300/60 font-semibold text-xs uppercase tracking-widest">Net Revenue</p>
            <p class="text-3xl font-extrabold text-white tracking-tight">{{ rwf(subtotal) }}</p>
          </div>
        </div>
        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-4">
          <div class="h-full bg-emerald-400 rounded-full" style="width: 100%"></div>
        </div>
      </div>

      <!-- VAT Card -->
      <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 shadow-2xl">
        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
        <div class="flex items-center gap-4 mb-4 relative z-10">
          <div class="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-inner">
            <svg class="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <div>
            <p class="text-amber-300/60 font-semibold text-xs uppercase tracking-widest">Tax Provision (18%)</p>
            <p class="text-3xl font-extrabold text-amber-400 tracking-tight">{{ rwf(vatAmount) }}</p>
          </div>
        </div>
        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-4">
          <div class="h-full bg-amber-400 rounded-full" style="width: 18%"></div>
        </div>
      </div>

      <!-- Total Card -->
      <div class="bg-emerald-600 rounded-3xl p-6 border border-emerald-400 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-[0_20px_50px_rgba(5,150,105,0.3)]">
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div class="flex items-center gap-4 mb-4 relative z-10">
          <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p class="text-emerald-100/80 font-semibold text-xs uppercase tracking-widest">Gross Liquidity</p>
            <p class="text-3xl font-extrabold text-white tracking-tight">{{ rwf(totalWithVat) }}</p>
          </div>
        </div>
        <div class="relative z-10 flex items-center gap-2 mt-4 text-emerald-100 text-sm font-medium">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Reconciled & Audited
        </div>
      </div>
    </div>

    <!-- Product Tables Section -->
    <div class="space-y-10">
      <!-- Successful Sales Table -->
      <section class="bg-[#064e3b]/40 backdrop-blur-xl rounded-[2.5rem] border border-emerald-500/20 shadow-2xl overflow-hidden">
        <div class="px-8 py-6 border-b border-emerald-500/10 flex items-center justify-between bg-emerald-950/20">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white tracking-tight">Successful Transactions</h2>
              <p class="text-emerald-300/40 text-xs font-medium uppercase tracking-widest mt-0.5">Verified Revenue Streams</p>
            </div>
          </div>
          <span class="px-4 py-1.5 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-bold border border-emerald-500/20">
            {{ store.successfulProducts.length }} COMPLETED
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-emerald-300/40 uppercase text-[10px] font-bold tracking-[0.2em] bg-emerald-950/40">
                <th class="px-8 py-5">Product Assets</th>
                <th class="px-8 py-5">Identifier</th>
                <th class="px-8 py-5">Unit Valuation</th>
                <th class="px-8 py-5">Volume</th>
                <th class="px-8 py-5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-emerald-500/5">
              <tr v-for="product in store.successfulProducts" :key="product.id" class="group hover:bg-emerald-500/5 transition-colors">
                <td class="px-8 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <img v-if="product.image" :src="product.image" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-emerald-900/40 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                    </div>
                    <div>
                      <p class="text-white font-bold group-hover:text-emerald-400 transition-colors">{{ product.name }}</p>
                      <p class="text-emerald-400/50 text-xs mt-1">{{ product.description?.substring(0,30) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-4 text-emerald-300/70 font-mono text-xs">#ID{{ product.id }}</td>
                <td class="px-8 py-4 text-white font-medium">{{ rwf(product.price) }}</td>
                <td class="px-8 py-4">
                  <span class="px-3 py-1 bg-white/5 rounded-lg text-white font-bold text-xs">{{ product.quantity }} Units</span>
                </td>
                <td class="px-8 py-4 text-right">
                  <p class="text-emerald-400 font-black text-lg">{{ rwf(Number(product.price) * Number(product.quantity)) }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Pending Sales Table -->
      <section class="bg-[#064e3b]/20 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div class="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/30">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white tracking-tight">Pending Inventory</h2>
              <p class="text-amber-300/40 text-xs font-medium uppercase tracking-widest mt-0.5">Projected Revenue Pipeline</p>
            </div>
          </div>
          <span class="px-4 py-1.5 bg-amber-500/10 rounded-full text-amber-400 text-xs font-bold border border-amber-500/20">
            {{ store.pendingProducts.length }} AWAITING
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-amber-300/30 uppercase text-[10px] font-bold tracking-[0.2em] bg-white/5">
                <th class="px-8 py-5">Projected Assets</th>
                <th class="px-8 py-5">Identifier</th>
                <th class="px-8 py-5">Current Price</th>
                <th class="px-8 py-5">Available</th>
                <th class="px-8 py-5 text-right">Potential</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="product in store.pendingProducts" :key="product.id" class="group hover:bg-white/5 transition-colors">
                <td class="px-8 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-xl overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img v-if="product.image" :src="product.image" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                    </div>
                    <p class="text-slate-300 font-bold group-hover:text-amber-400 transition-colors">{{ product.name }}</p>
                  </div>
                </td>
                <td class="px-8 py-4 text-slate-500 font-mono text-xs">#ID{{ product.id }}</td>
                <td class="px-8 py-4 text-slate-400">{{ rwf(product.price) }}</td>
                <td class="px-8 py-4">
                  <span class="px-3 py-1 bg-amber-500/10 rounded-lg text-amber-400 font-bold text-xs">{{ product.quantity }} Stock</span>
                </td>
                <td class="px-8 py-4 text-right">
                  <p class="text-amber-500/80 font-bold text-base">{{ rwf(Number(product.price) * Number(product.quantity)) }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Final Tally -->
    <div class="mt-12 bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-3xl text-center max-w-4xl mx-auto">
      <h3 class="text-emerald-300/40 uppercase text-xs font-black tracking-[0.5em] mb-4">Consolidated Financial Statement</h3>
      <div class="flex flex-col md:flex-row justify-center items-center gap-12">
        <div>
          <p class="text-slate-400 text-sm font-medium">Accumulated Assets</p>
          <p class="text-3xl font-black text-white mt-1">{{ rwf(subtotal) }}</p>
        </div>
        <div class="w-px h-12 bg-white/10 hidden md:block"></div>
        <div>
          <p class="text-slate-400 text-sm font-medium">Projected Pipeline</p>
          <p class="text-3xl font-black text-amber-500 mt-1">
            {{ rwf(totalPending) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glassmorphism Refinements */
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.2);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.4);
}
</style>
