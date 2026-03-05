import { defineStore } from 'pinia'

const MAX_ATTEMPTS = 3

function getUsers() {
    return JSON.parse(localStorage.getItem('ems_users') || '[]')
}

function saveUsers(users) {
    localStorage.setItem('ems_users', JSON.stringify(users))
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('ems_current_user') || 'null'),
        loginError: '',
        registerError: '',
        registerSuccess: ''
    }),

    getters: {
        isAdmin: (state) => state.user?.role === 'admin',
        isCustomer: (state) => state.user?.role === 'customer',
        isAuthenticated: (state) => !!state.user
    },

    actions: {
        clearMessages() {
            this.loginError = ''
            this.registerError = ''
            this.registerSuccess = ''
        },

        register(name, email, password, role = 'customer') {
            this.clearMessages()
            const users = getUsers()

            if (!name.trim() || !email.trim() || !password.trim()) {
                this.registerError = 'All fields are required.'
                return false
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.registerError = 'Please enter a valid email address.'
                return false
            }
            if (password.length < 6) {
                this.registerError = 'Password must be at least 6 characters.'
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
                role,
                failedAttempts: 0,
                locked: false
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
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

            // Success – reset failed attempts
            user.failedAttempts = 0
            saveUsers(users)

            const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role }
            this.user = sessionUser
            localStorage.setItem('ems_current_user', JSON.stringify(sessionUser))
            return true
        },

        logout() {
            this.user = null
            this.clearMessages()
            localStorage.removeItem('ems_current_user')
        },

        // Admin utility – unlock a user
        unlockUser(email) {
            const users = getUsers()
            const u = users.find(u => u.email.toLowerCase() === email.toLowerCase())
            if (u) {
                u.locked = false
                u.failedAttempts = 0
                saveUsers(users)
            }
        },

        // Seed a default admin account on first app load
        seedDefaultUsers() {
            const users = getUsers()
            const adminEmail = 'ndacyayisengaherve8@gmail.com'
            const exists = users.find(u => u.email.toLowerCase() === adminEmail)
            if (!exists) {
                users.push({
                    id: 9001,
                    name: 'Herve Ndacyayisenga',
                    email: adminEmail,
                    password: '0987654321',
                    role: 'admin',
                    failedAttempts: 0,
                    locked: false
                })
                saveUsers(users)
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
            if (newPassword.length < 6) {
                return { ok: false, error: 'New password must be at least 6 characters.' }
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
