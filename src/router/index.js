import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Landing from '../views/Landing.vue'
import SignIn from '../views/SignIn.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Dashboard from '../views/Dashboard.vue'
import Pending from '../views/Pending.vue'
import Successful from '../views/Successful.vue'
import TotalMoney from '../views/TotalMoney.vue'
import CustomerView from '../views/CustomerView.vue'
import AccountsView from '../views/AccountsView.vue'

// Define the application routes. Each route maps a URL path to a specific Vue component.
const routes = [
    // --- Public Authentication Routes ---
    {
        path: '/',
        name: 'Landing',
        component: Landing,
        meta: { guest: true }
    },
    {
        path: '/login',
        name: 'SignIn',
        component: SignIn,
        meta: { guest: true } // 'guest: true' means only unauthenticated users should access this
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: { guest: true }
    },

    // --- Product Manager (formerly Admin) Routes ---
    // These require the user to be logged in AND have the 'manager' or 'superadmin' role
    {
        path: '/admin',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, role: 'manager' } 
    },
    {
        path: '/admin/pending',
        name: 'Pending',
        component: Pending,
        meta: { requiresAuth: true, role: 'manager' }
    },
    {
        path: '/admin/successful',
        name: 'Successful',
        component: Successful,
        meta: { requiresAuth: true, role: 'manager' }
    },
    {
        path: '/admin/total-money',
        name: 'TotalMoney',
        component: TotalMoney,
        meta: { requiresAuth: true, role: 'superadmin' }
    },

    // --- Super Admin restricted routes ---
    {
        path: '/admin/accounts',
        name: 'Accounts',
        component: AccountsView,
        meta: { requiresAuth: true, role: 'superadmin' }
    },

    // --- Customer Routes ---
    // These require the user to be logged in AND have the 'customer' role
    {
        path: '/shop',
        name: 'CustomerView',
        component: CustomerView,
        meta: { requiresAuth: true, role: 'customer' }
    },

    // --- Catch-all Fallback ---
    // If a user navigates to an unknown URL, automatically redirect them to the landing page
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Global Navigation Guard: Runs before EVERY route change
router.beforeEach((to, from, next) => {
    // Access the authentication state from Pinia
    const authStore = useAuthStore()
    const { isAuthenticated, isSuperAdmin, isManager, isCustomer } = authStore

    // 1. Prevent logged-in users from accessing guest pages (like Login)
    if (to.meta.guest) {
        if (isAuthenticated) {
            // Redirect based on role
            if (isSuperAdmin) next({ name: 'Accounts' })
            else if (isManager) next({ name: 'Dashboard' })
            else next({ name: 'CustomerView' })
        } else {
            next() // Proceed naturally if not logged in
        }
        return
    }

    // 2. Prevent unauthenticated users from accessing protected pages
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'SignIn' }) // Redirect to login
        return
    }

    // 3. SuperAdmin exclusive routes
    if (to.meta.role === 'superadmin' && !isSuperAdmin) {
        next(isManager ? { name: 'Dashboard' } : { name: 'CustomerView' })
        return
    }

    // 4. Product Manager (or SuperAdmin) routes
    if (to.meta.role === 'manager' && (!isManager && !isSuperAdmin)) {
        next(isCustomer ? { name: 'CustomerView' } : { name: 'SignIn' })
        return
    }

    // 5. Prevent non-customers from accessing customer-only pages
    if (to.meta.role === 'customer' && !isCustomer) {
        if (isSuperAdmin) next({ name: 'Accounts' })
        else if (isManager) next({ name: 'Dashboard' })
        else next({ name: 'SignIn' })
        return
    }

    // If all checks pass, allow the navigation to proceed
    next()
})

export default router
