# Scrap Mama ♻️

Scrap Mama is a doorstep scrap-pickup platform prototype based on the supplied Product & Technical Requirements.

## Experiences
- Customer App: rates, booking, address, pickup history and profile
- Partner App: requests, schedule, active pickup, weighing/pricing concepts and earnings
- Admin / Management: dashboard, pickup operations, users, scrap rates, reports and settings

## Product rules represented
- Pickup lifecycle: PENDING → ASSIGNED → ACCEPTED → EN_ROUTE → ARRIVED → WEIGHING → PAYMENT_PENDING → COMPLETED
- CANCELLED is a terminal alternative
- Final amount = actual collected weight × applicable scrap rate
- Official rates are managed by administrators
- Live location is an operational feature placeholder in this UI

## Run in GitHub Codespaces

    npm install
    npm run dev

Open forwarded port **5173**.

## Current architecture

This first slice is a frontend prototype for rapid workflow review. The supplied requirements call for Flutter customer/collector apps, a Node.js/Express API, MongoDB, JWT authentication and Socket.IO real-time tracking. Those backend/mobile boundaries can be added next without changing the product workflows.

## Next implementation slices
1. Node.js/Express API + MongoDB models
2. JWT/OTP authentication and role authorization
3. Customer/partner/admin API integration
4. Socket.IO live pickup tracking
5. Payment/transaction integration
6. Push notifications
7. Tests and production deployment
