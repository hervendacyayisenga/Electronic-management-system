# Human-Centered Design

## 1. User Personas

### Persona 1: "Client" - The Tech-Savvy Customer
*   **Name:** Grace M.
*   **Background:** 28 years old, graphic designer. She frequently shops online for the latest electronics, peripherals, and software tools to support her freelance business. She values speed, aesthetics, and clear information.
*   **Goals:** 
    *   To quickly find and purchase electronics with minimal friction.
    *   To see clear pricing (in RWF) without hidden fees.
    *   To know immediately if a product is in stock or out of stock.
*   **Pain Points:** 
    *   Cluttered, ugly websites that look untrustworthy.
    *   Complicated checkout processes requiring too many steps.
    *   Finding out an item is out of stock *after* trying to buy it.
*   **Design Solution:** The customer view features high-quality imagery, a dark-mode inspired sleek login, clear "Buy" buttons with immediate MoMo payment modal popups, and instant visual feedback (Red "Out of Stock" badges) when inventory is depleted. 

### Persona 2: "Admin" - The Store Manager
*   **Name:** Pascal Ndizeye
*   **Background:** 45 years old, owner of the GoDigital electronics shop. He is transitioning from manual, paper-based record-keeping to a digital system. He needs something straightforward that doesn't overwhelm him with complex IT jargon.
*   **Goals:**
    *   To easily add new products to the inventory and update their prices/quantities.
    *   To see a quick overview of shop performance (total products, active stock).
    *   To manage incoming sales and track which orders are pending vs. successful.
*   **Pain Points:**
    *   Losing track of manual paper receipts and stock levels.
    *   Software that requires extensive training to use basic functions.
    *   Accidentally deleting data because a UI was confusing.
*   **Design Solution:** The Admin Dashboard utilizes a clear, persistent sidebar navigation. Data is presented in clean, well-spaced tables. Critical actions (like deleting a product) are clearly marked, and forms for adding products are simple and validated to prevent data entry errors. 

## 2. User Flow Diagrams

### Role: Customer (Purchase Flow)
```mermaid
graph TD
    A[Lands on /login] --> B{Has Account?}
    B -- No --> C[Clicks 'Create Account']
    C --> D[Fills Registration Form]
    D --> E[Logs In]
    B -- Yes --> E[Logs In]
    E --> F[Redirected to /shop (CustomerView)]
    F --> G[Browses Product List]
    G --> H[Clicks 'Buy' on a laptop]
    H --> I[Payment Modal Opens (MoMo)]
    I --> J[Enters MoMo Details & Confirms]
    J --> K[Payment Success Message]
    K --> L[UI updates automatically: Stock decreases or item marked 'Out of Stock']
```

### Role: Admin (Inventory Management Flow)
```mermaid
graph TD
    A[Logs into /login as Admin] --> B[Redirected to /admin (Dashboard)]
    B --> C[Views System Overview Cards]
    B --> D[Clicks 'Add New Product' Button]
    D --> E[Modal Opens: Enters Name, Price, QTY, Image URL]
    E --> F[Clicks 'Save']
    F --> G[Product Table Updates Instantly]
    B --> H[Navigates via Sidebar to /admin/pending]
    H --> I[Reviews pending customer orders]
```

## 3. Explanation of Design Decisions

1.  **Aesthetic Choice & Trust:** The login screen utilizes a premium, split-screen design with a dark, high-quality electronics background image on the left and a clean, white, card-based login form on the right. This immediately establishes trust and signals that the application is modern and professional, catering to Grace's desire for aesthetically pleasing tech platforms.
2.  **Role Separation:** The UI strictly separates the admin experience from the customer experience. Customers never see "tables" or "dashboards"; they see "cards" and "shops." Admins see data-dense tables suitable for management. This reduces cognitive load for both personas.
3.  **Frictionless Payment Mockup:** Instead of a complex multi-page cart system, the design utilizes a direct "Buy" button that triggers a unified MoMo modal. This decision addresses the common pain point of cart abandonment by keeping the user on the same page and simplifying the checkout process.
4.  **Accessibility First:** Colors were chosen to ensure high contrast (e.g., standard blue buttons on white backgrounds, clear red error text). All forms include proper labels and ARIA attributes for screen readers, ensuring the application is usable by individuals with visual impairments.
