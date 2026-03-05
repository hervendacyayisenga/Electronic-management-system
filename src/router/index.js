import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import SignIn from '../views/SignIn.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Dashboard from '../views/Dashboard.vue'
import Pending from '../views/Pending.vue'
import Successful from '../views/Successful.vue'
import TotalMoney from '../views/TotalMoney.vue'
import CustomerView from '../views/CustomerView.vue'

const routes = [
    {
        path: '/login',
        name: 'SignIn',
        component: SignIn,
        meta: { guest: true }
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: { guest: true }
    },
    // Admin routes
    {
        path: '/admin',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/pending',
        name: 'Pending',
        component: Pending,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/successful',
        name: 'Successful',
        component: Successful,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/total-money',
        name: 'TotalMoney',
        component: TotalMoney,
        meta: { requiresAuth: true, role: 'admin' }
    },
    // Customer route
    {
        path: '/shop',
        name: 'CustomerView',
        component: CustomerView,
        meta: { requiresAuth: true, role: 'customer' }
    },
    // Catch-all redirect
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const { isAuthenticated, isAdmin, isCustomer } = authStore

    if (to.meta.guest) {
        if (isAuthenticated) {
            next(isAdmin ? { name: 'Dashboard' } : { name: 'CustomerView' })
        } else {
            next()
        }
        return
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'SignIn' })
        return
    }

    if (to.meta.role === 'admin' && !isAdmin) {
        next(isCustomer ? { name: 'CustomerView' } : { name: 'SignIn' })
        return
    }

    if (to.meta.role === 'customer' && !isCustomer) {
        next(isAdmin ? { name: 'Dashboard' } : { name: 'SignIn' })
        return
    }

    next()
})

export default router
