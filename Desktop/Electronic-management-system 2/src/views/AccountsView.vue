<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import Sidebar from '../components/Sidebar.vue'

const authStore = useAuthStore()

// Reactive list — refreshed after every action so the UI stays in sync
const allUsers = ref(loadUsers())

function loadUsers() {
  return authStore.getAllUsers().filter(u => u.role !== 'superadmin')
}

function refresh() {
  allUsers.value = loadUsers()
}

function toggleApproval(email) {
  authStore.toggleManagerApproval(email)
  refresh()
}

function deleteUser(email, name) {
  if (confirm(`Are you sure you want to permanently delete the account of "${name}"?`)) {
    authStore.deleteUser(email)
    refresh()
  }
}

// ── Password Reset Modal ──────────────────────────────────────────────────────
const resetTarget = ref(null)   // the user object being reset
const newPass     = ref('')
const confirmPass = ref('')
const showNew     = ref(false)
const showConfirm = ref(false)
const resetError  = ref('')
const resetOk     = ref(false)

function openReset(user) {
  resetTarget.value = user
  newPass.value     = ''
  confirmPass.value = ''
  showNew.value     = false
  showConfirm.value = false
  resetError.value  = ''
  resetOk.value     = false
}

function closeReset() {
  resetTarget.value = null
}

function submitReset() {
  resetError.value = ''
  resetOk.value    = false

  if (!newPass.value || !confirmPass.value) {
    resetError.value = 'Both fields are required.'
    return
  }
  if (newPass.value !== confirmPass.value) {
    resetError.value = 'Passwords do not match.'
    return
  }

  const result = authStore.adminResetPassword(resetTarget.value.email, newPass.value)
  if (!result.ok) {
    resetError.value = result.error
    return
  }

  resetOk.value = true
  setTimeout(closeReset, 1500)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <Sidebar />

    <main class="flex-1 ml-48 p-8 max-w-7xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Account Management</h1>
          <p class="text-slate-500 text-sm mt-1">Approve or remove Product Managers and view all Customer accounts.</p>
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
                <th class="px-6 py-4 font-medium">Actions</th>
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
                  <!-- Manager-specific actions -->
                  <div v-if="user.role === 'manager'" class="flex gap-2 items-center flex-wrap">

                    <!-- Approve / Revoke -->
                    <button
                      @click="toggleApproval(user.email)"
                      class="px-4 py-1.5 rounded-full text-xs font-bold transition-all w-[110px] shadow-sm text-center"
                      :class="user.approved
                        ? 'bg-green-100 border border-green-300 text-green-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
                        : 'bg-orange-100 border border-orange-300 text-orange-700 hover:bg-green-500 hover:text-white hover:border-green-600'"
                    >
                      <span v-if="user.approved">Active ✔</span>
                      <span v-else>Approve? ⏳</span>
                    </button>

                    <!-- Reset Password -->
                    <button
                      @click="openReset(user)"
                      class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm bg-indigo-100 border border-indigo-300 text-indigo-700 hover:bg-indigo-500 hover:text-white hover:border-indigo-600 flex items-center gap-1"
                      title="Reset Password"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                      </svg>
                      Reset PW
                    </button>

                    <!-- Delete -->
                    <button
                      @click="deleteUser(user.email, user.name)"
                      class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm bg-red-100 border border-red-300 text-red-700 hover:bg-red-500 hover:text-white hover:border-red-600"
                      title="Delete Product Manager"
                    >
                      <svg class="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Customers -->
                  <div v-else class="text-slate-400 text-xs italic">N/A</div>
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

    <!-- ── Reset Password Modal ─────────────────────────────────────────── -->
    <div v-if="resetTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <!-- Header -->
        <div class="bg-indigo-600 px-6 py-5 text-white">
          <h2 class="text-lg font-bold">Reset Password</h2>
          <p class="text-indigo-200 text-sm mt-0.5">{{ resetTarget.name }} · {{ resetTarget.email }}</p>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-4">
          <!-- New Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
            <div class="relative">
              <input
                v-model="newPass"
                :type="showNew ? 'text' : 'password'"
                placeholder="Min 10 chars, mixed case, symbol"
                class="w-full pr-10 pl-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              <button type="button" @click="showNew = !showNew"
                class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                <svg v-if="!showNew" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-8 0-1.09.252-2.124.7-3.05M6.34 6.34A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 8 0 1.347-.328 2.617-.912 3.737M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Confirm Password</label>
            <div class="relative">
              <input
                v-model="confirmPass"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Repeat new password"
                class="w-full pr-10 pl-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              <button type="button" @click="showConfirm = !showConfirm"
                class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                <svg v-if="!showConfirm" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-8 0-1.09.252-2.124.7-3.05M6.34 6.34A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 8 0 1.347-.328 2.617-.912 3.737M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error / Success -->
          <p v-if="resetError" class="text-red-500 text-xs font-medium">{{ resetError }}</p>
          <p v-if="resetOk" class="text-emerald-600 text-xs font-bold flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Password updated successfully!
          </p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="closeReset"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button @click="submitReset" :disabled="resetOk"
            class="px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50">
            Save Password
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
