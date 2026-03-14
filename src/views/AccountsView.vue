<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import Sidebar from '../components/Sidebar.vue'

const authStore = useAuthStore()
// Retrieve all registered users for the Admin to view
// Filter out the superadmin account itself from the list
const allUsers = computed(() => {
  return authStore.getAllUsers().filter(u => u.role !== 'superadmin')
})

function toggleApproval(email) {
  authStore.toggleManagerApproval(email)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- SuperAdmin requires the Sidebar component too -->
    <Sidebar />

    <main class="flex-1 ml-48 p-8 max-w-7xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Account Management</h1>
          <p class="text-slate-500 text-sm mt-1">Approve Product Managers and view all Customer accounts.</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 bg-gray-50 border-b border-gray-100">
                <th class="px-6 py-4 font-medium">Name</th>
                <th class="px-6 py-4 font-medium">Email</th>
                <th class="px-6 py-4 font-medium">Role</th>
                <th class="px-6 py-4 font-medium">Status / Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in allUsers" :key="user.email" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-semibold text-slate-700">{{ user.name }}</td>
                <td class="px-6 py-4 text-slate-500">{{ user.email }}</td>
                
                <td class="px-6 py-4">
                  <span v-if="user.role === 'manager'" class="px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                    Product Manager
                  </span>
                  <span v-else class="px-2.5 py-1 rounded bg-gray-100 text-slate-600 text-xs font-medium border border-gray-200">
                    Customer
                  </span>
                </td>

                <td class="px-6 py-4">
                  <!-- Actions specifically for managers -->
                  <div v-if="user.role === 'manager'">
                    <button 
                      @click="toggleApproval(user.email)"
                      class="px-4 py-1.5 rounded-full text-xs font-bold transition-all w-[140px] shadow-sm"
                      :class="user.approved 
                        ? 'bg-green-100 border border-green-300 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300' 
                        : 'bg-orange-100 border border-orange-300 text-orange-700 hover:bg-green-500 hover:text-white hover:border-green-600'"
                    >
                      <span v-if="user.approved" class="group-hover:hidden">Active ✔</span>
                      <span v-else>Approve? ⏳</span>
                    </button>
                  </div>
                  <!-- Customers don't need explicit approval -->
                  <div v-else class="text-slate-400 text-xs italic">
                    N/A
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="allUsers.length === 0" class="p-8 text-center text-slate-400">
            No accounts found.
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
