import { defineStore } from 'pinia'

// Maximum number of allowed incorrect password attempts before the account is locked
const MAX_ATTEMPTS = 3

// Helper function to load the array of users from the browser's localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('ems_users') || '[]')
}

// Helper function to save the array of users back to the browser's localStorage
function saveUsers(users) {
    localStorage.setItem('ems_users', JSON.stringify(users))
}

// Define the Pinia store for Authentication
export const useAuthStore = defineStore('auth', {
    state: () => ({
        // Try to load an existing active session from localStorage when the app starts
        user: JSON.parse(localStorage.getItem('ems_current_user') || 'null'),
        
        // Strings for displaying UI messages to the user during login/registration
        loginError: '',
        registerError: '',
        registerSuccess: ''
    }),

    getters: {
        // Quick boolean checks for the current user's role and authentication status
        isSuperAdmin: (state) => state.user?.role === 'superadmin',
        isManager: (state) => state.user?.role === 'manager', // Previously called admin
        isCustomer: (state) => state.user?.role === 'customer',
        isAuthenticated: (state) => !!state.user
    },

    actions: {
        // Clear old error messages when starting a new action
        clearMessages() {
            this.loginError = ''
            this.registerError = ''
            this.registerSuccess = ''
        },

        // Attempt to create a new user account
        register(name, email, password, role = 'customer') {
            this.clearMessages()
            const users = getUsers() // Fetch existing database of users

            if (!name.trim() || !email.trim() || !password.trim()) {
                this.registerError = 'All fields are required.'
                return false
            }
            if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
                this.registerError = 'Name must contain letters and spaces only.'
                return false
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                this.registerError = 'Please enter a valid email address (e.g., user@example.com).'
                return false
            }
            if (password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
                this.registerError = 'Password must be at least 10 characters and include a number, uppercase, lowercase, and special character.'
                return false
            }

            const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
            if (exists) {
                this.registerError = 'An account with this email already exists.'
                return false
            }

            const newUser = {
                id: Date.now(),
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                // Replace 'admin' with 'manager' during transition
                role: role === 'admin' ? 'manager' : role,
                failedAttempts: 0,
                locked: false,
                // Product Managers need superadmin approval before editing/adding products
                approved: role === 'admin' || role === 'manager' ? false : true
            }
            users.push(newUser)
            saveUsers(users)
            this.registerSuccess = 'Account created successfully! You can now sign in.'
            return true
        },

        login(email, password) {
            this.clearMessages()
            const users = getUsers()

            if (!email.trim() || !password.trim()) {
                this.loginError = 'Email and password are required.'
                return false
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                this.loginError = 'Please enter a valid email address.'
                return false
            }

            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim())

            if (userIndex === -1) {
                this.loginError = 'No account found with this email address.'
                return false
            }

            const user = users[userIndex]

            if (user.locked) {
                this.loginError = '🔒 Account locked due to too many failed attempts. Please contact support.'
                return false
            }

            if (user.password !== password) {
                user.failedAttempts = (user.failedAttempts || 0) + 1
                const remaining = MAX_ATTEMPTS - user.failedAttempts

                if (user.failedAttempts >= MAX_ATTEMPTS) {
                    user.locked = true
                    saveUsers(users)
                    this.loginError = '🔒 Account locked! You have exceeded 3 failed login attempts.'
                } else {
                    saveUsers(users)
                    this.loginError = `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account lockout.`
                }
                return false
            }

            // Success – reset failed attempts and log the user in directly
            user.failedAttempts = 0
            saveUsers(users)

            const sessionUser = { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                approved: user.approved
            }
            this.user = sessionUser
            localStorage.setItem('ems_current_user', JSON.stringify(sessionUser))
            
            return true
        },

        // Log the current user out by clearing the session from state and localStorage
        logout() {
            this.user = null
            this.clearMessages()
            localStorage.removeItem('ems_current_user')
        },

        // Admin utility – unlock a user manually
        unlockUser(email) {
            const users = getUsers()
            const u = users.find(u => u.email.toLowerCase() === email.toLowerCase())
            if (u) {
                u.locked = false
                u.failedAttempts = 0
                saveUsers(users) // Persist the unlocked state
            }
        },

        // Seed a default admin account on first app load (called by main.js)
        seedDefaultUsers() {
            const users = getUsers()
            const adminEmail = 'adminems@gmail.com'
            const exists = users.find(u => u.email.toLowerCase() === adminEmail)
            if (!exists) {
                users.push({
                    id: 9999,
                    name: 'Super Admin',
                    email: adminEmail,
                    password: 'WebTech123@',
                    role: 'superadmin',
                    failedAttempts: 0,
                    locked: false,
                    approved: true
                })
                saveUsers(users)
            }
        },

        // Get all users for the Accounts Dashboard (Admin only)
        getAllUsers() {
            return getUsers()
        },

        // Toggle the approval status of a Product Manager (Admin only)
        toggleManagerApproval(email) {
            const users = getUsers()
            const u = users.find(u => u.email.toLowerCase() === email.toLowerCase())
            if (u && u.role === 'manager') {
                u.approved = !u.approved
                saveUsers(users)
                // If it's the currently logged-in user, update session
                if (this.user && this.user.email === u.email) {
                    this.user.approved = u.approved
                    localStorage.setItem('ems_current_user', JSON.stringify(this.user))
                }
            }
        },

        // Check if an email exists (for forgot-password step 1)
        findUserByEmail(email) {
            const users = getUsers()
            return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null
        },

        // Generate a password reset simulation token
        generateResetToken(email) {
            const users = getUsers()
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
            if (!user) return null

            const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
            const tokens = JSON.parse(localStorage.getItem('ems_reset_tokens') || '{}')
            // Token expires in 15 minutes
            tokens[token] = { email: user.email, expires: Date.now() + 15 * 60000 }
            localStorage.setItem('ems_reset_tokens', JSON.stringify(tokens))

            return token
        },

        // Reset password using the token sent in the "email"
        resetPasswordWithToken(token, newPassword) {
            if (newPassword.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(newPassword)) {
                return { ok: false, error: 'Password must be at least 10 characters and include a number, uppercase, lowercase, and special character.' }
            }

            const tokens = JSON.parse(localStorage.getItem('ems_reset_tokens') || '{}')
            const tokenData = tokens[token]

            if (!tokenData) return { ok: false, error: 'Invalid or missing reset token.' }
            if (Date.now() > tokenData.expires) {
                delete tokens[token]
                localStorage.setItem('ems_reset_tokens', JSON.stringify(tokens))
                return { ok: false, error: 'This reset link has expired.' }
            }

            const users = getUsers()
            const idx = users.findIndex(u => u.email.toLowerCase() === tokenData.email)
            if (idx === -1) return { ok: false, error: 'Account not found.' }

            users[idx].password = newPassword
            users[idx].failedAttempts = 0
            users[idx].locked = false
            saveUsers(users)

            // Consume token
            delete tokens[token]
            localStorage.setItem('ems_reset_tokens', JSON.stringify(tokens))

            return { ok: true }
        }
    }
})
