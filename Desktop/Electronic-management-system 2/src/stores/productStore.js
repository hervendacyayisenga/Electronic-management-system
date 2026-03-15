import { defineStore } from 'pinia'

// 15 Electronic devices priced in Rwandan Francs (RWF)
const SEED_PRODUCTS = [
    {
        id: 2001,
        name: 'Smartphone',
        description: 'Android 14, 6.7" AMOLED, 128GB, 5G, dual SIM',
        price: 185000,
        quantity: 20,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2002,
        name: 'Laptop',
        description: 'Intel Core i5, 16GB RAM, 512GB SSD, 15.6" FHD display',
        price: 620000,
        quantity: 10,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
        paid: true
    },
    {
        id: 2003,
        name: 'Desktop Computer',
        description: 'Intel Core i7, 32GB RAM, 1TB SSD, GTX 1660 Super GPU',
        price: 780000,
        quantity: 6,
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2004,
        name: 'Tablet',
        description: '10.9" IPS display, 64GB, Wi-Fi + 4G, fingerprint sensor',
        price: 125000,
        quantity: 15,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
        paid: true
    },
    {
        id: 2005,
        name: 'Smartwatch',
        description: 'Heart rate, GPS, 7-day battery, waterproof IP68',
        price: 95000,
        quantity: 25,
        image: 'https://images.unsplash.com/photo-1544117518-3baf3525d848?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2006,
        name: 'Television (Smart TV)',
        description: '55" 4K UHD, HDR10, built-in Netflix, YouTube, Wi-Fi',
        price: 420000,
        quantity: 8,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2007,
        name: 'Radio',
        description: 'FM/AM/SW digital radio, rechargeable battery, USB playback',
        price: 22000,
        quantity: 40,
        image: 'https://images.unsplash.com/photo-1594402936307-e83618de4d11?q=80&w=800&auto=format&fit=crop',
        paid: true
    },
    {
        id: 2008,
        name: 'Digital Camera',
        description: '24MP sensor, 4K video, 10x optical zoom, Wi-Fi, image stabilization',
        price: 310000,
        quantity: 12,
        image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2009,
        name: 'Printer',
        description: 'Wireless inkjet printer, duplex printing, 4800dpi, AirPrint',
        price: 88000,
        quantity: 18,
        image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2010,
        name: 'Headphones',
        description: 'Active noise canceling, 30hr battery, Bluetooth 5.3, foldable',
        price: 65000,
        quantity: 35,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        paid: true
    },
    {
        id: 2011,
        name: 'Bluetooth Speaker',
        description: '360° surround sound, IP67 waterproof, 24hr playtime, TWS pairing',
        price: 48000,
        quantity: 30,
        image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2012,
        name: 'Gaming Console',
        description: '4K gaming, 1TB SSD, 120fps, wireless controller, online gaming',
        price: 550000,
        quantity: 5,
        image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2013,
        name: 'Router (Wi-Fi Router)',
        description: 'Wi-Fi 6, dual-band 3000Mbps, 4 antennas, parental controls',
        price: 72000,
        quantity: 22,
        image: 'https://images.unsplash.com/photo-1625514523023-6ca03683884e?q=80&w=800&auto=format&fit=crop',
        paid: true
    },
    {
        id: 2014,
        name: 'Microwave Oven',
        description: '25L capacity, 900W, digital display, 10 power levels, grill',
        price: 95000,
        quantity: 14,
        image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop',
        paid: false
    },
    {
        id: 2015,
        name: 'Refrigerator',
        description: '320L, no-frost, inverter compressor, A+ energy-rated, ice maker',
        price: 385000,
        quantity: 7,
        image: 'https://images.unsplash.com/photo-1571175432270-ef02d813d42e?q=80&w=800&auto=format&fit=crop',
        paid: false
    }
]

// Define the Pinia store for Products (Inventory and Sales)
export const useProductStore = defineStore('products', {
    state: () => ({
        products: [] // Holds the list of all electronic devices
    }),

    getters: {
        // A product is considered 'pending' (inventory) if it hasn't been paid for
        pendingProducts: (state) =>
            state.products.filter(p => !p.paid),

        // A product is considered 'successful' (sold) if it has been paid for
        successfulProducts: (state) =>
            state.products.filter(p => p.paid),

        // Calculates the gross revenue by summing (price * quantity) of all sold products
        totalMoney: (state) =>
            state.products
                .filter(p => p.paid)
                .reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0)
    },

    actions: {
        // Fetch products from localStorage when the app loads
        async loadProducts() {
            const data = localStorage.getItem('ems_products')
            if (data) {
                this.products = JSON.parse(data) // Load existing data
            } else {
                // First load ever for this browser – seed with 15 default electronics
                this.products = SEED_PRODUCTS
                await this.saveProducts()
            }
        },

        // Helper action to persist the current state into localStorage
        async saveProducts() {
            localStorage.setItem('ems_products', JSON.stringify(this.products))
        },

        // Create a new product and add it to the inventory
        async addProduct(product) {
            const newProduct = {
                ...product,
                id: Date.now(), // Generate a unique ID
                paid: false     // Fresh inventory is never "paid" yet
            }
            this.products.push(newProduct)
            await this.saveProducts()
        },

        // Remove a product entirely from the system
        async deleteProduct(id) {
            this.products = this.products.filter(p => p.id !== id)
            await this.saveProducts()
        },

        // Update an existing product's details (e.g., changing price or specs)
        async updateProduct(updatedProduct) {
            const index = this.products.findIndex(p => p.id === updatedProduct.id)
            if (index !== -1) {
                this.products[index] = { ...updatedProduct }
                await this.saveProducts()
            }
        },

        // Process a sale: transition an item from Pending to Successful
        async payProduct(id) {
            const product = this.products.find(p => p.id === id)
            if (product) {
                product.paid = true // This flags it as a completed transaction
                await this.saveProducts()
            }
        },

        // Mark an item as unavailable/sold out
        async markOutOfStock(id) {
            const product = this.products.find(p => p.id === id)
            if (product) {
                product.paid = true
                product.outOfStock = true
                await this.saveProducts()
            }
        }
    }
})
