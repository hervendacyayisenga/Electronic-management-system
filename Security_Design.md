# Secure Design & Threat Modeling

## 1. Threat Modeling Overview

### Assets to Protect
*   **User Data:** Usernames, email addresses, passwords, and user roles (Admin vs. Customer).
*   **Business Data:** Product inventory, stock levels, sales records, and pending/successful orders.
*   **Application Integrity:** The application routes and state, preventing unauthorized access to the admin dashboard or stock manipulation.

### Possible Attackers
*   **External Malicious Actors:** Individuals attempting to exploit vulnerabilities (e.g., XSS) to steal sessions or data.
*   **Privilege Escalators:** Customers attempting to access Admin-only routes to manipulate products or approve their own pending orders.
*   **Automated Bots:** Scripts looking for open forms to spam or brute-force logins.

### Possible Threats
1.  **Cross-Site Scripting (XSS):** An attacker injects malicious scripts into the product names or descriptions, which then execute in the admin's browser when they view the dashboard.
2.  **Unauthorized Access (Broken Access Control):** A customer navigates directly to `/admin` or `/admin/pending` to access restricted data without proper authentication or role checks.
3.  **Data Exposure:** Sensitive user information (like passwords) being stored in plain text or exposed in the local storage, allowing an attacker with physical access to steal them.

### Mitigation Strategies
*   **XSS Mitigation:** Vue.js automatically escapes HTML content when using text interpolation (`{{ }}`). This prevents injected scripts from executing. We rely completely on Vue's built-in protections and avoid `v-html`.
*   **Access Control:** Implementing strict Route Guards (`beforeEach`) in Vue Router. Every route change checks the Pinia `authStore` to ensure the user is not only authenticated but possesses the correct `role` metadata required for that route.
*   **Data Protection Framework:** In a real-world scenario, passwords would be hashed (e.g., bcrypt) on a backend server. In this simulated frontend environment, we ensure passwords are never displayed back to the user in plain text during transit phases, and we clear form inputs immediately after use.

## 2. Secure Coding Decisions

### Why Inline HTML Injection was Avoided
Using Vue's `v-html` directive poses a severe security risk if the content being rendered is user-supplied (like product names or user profiles). If an attacker inputs `<script>alert('Steal Cookies')</script>`, `v-html` will execute it. By strictly using Vue's standard mustache syntax `{{ data }}`, the framework treats the input as pure text, neutralizing any scripting attacks. I ensured that all dynamically rendered product strings and dashboard messages use safe text interpolation.

### How User Input is Validated
*   **Client-Side Validation:** All forms (Login, Registration, Add Product, Edit Product) utilize HTML5 validation attributes (`required`, `type="email"`, `minlength`).
*   **State Validation:** Before processing a registration, the application validates that the password and password confirmation fields match.
*   **Type Safety:** Number inputs (prices, quantities) in the forms strictly require numeric data types, preventing database/state errors caused by injecting unauthorized characters. 
*   *Thinking like an attacker:* I recognize that client-side validation can be bypassed by intercepting requests or modifying the DOM. Therefore, in a full-stack context, these exact same validations must be duplicated on the backend API before data is ever written to the database.

### Why Exposing Sensitive Data was Avoided
During the development of the simulated backend (Pinia Auth Store), I made sure that the error messages returned to the user are generic where sensible. While the simulated store temporarily retains the user array, in a real application, the frontend should only ever receive a secure HTTP-Only JWT token and a generic user profile (excluding the password hash). By ensuring the application state relies on role-based access (`isAdmin`, `isCustomer`) rather than checking raw permissions against a vulnerable local list, we minimize the attack surface if the local storage is inspected.
