# Scrap Mama API

Node.js + Express + MongoDB + Socket.IO backend foundation for the Scrap Mama platform.

## Run in Codespaces

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set `MONGODB_URI` to your MongoDB connection string. The default local URI works only when MongoDB is running in the same environment.

## API foundation

- OTP request/verification (development OTP is `123456` when `OTP_MODE=dev`)
- JWT authentication and customer/collector/admin roles
- Scrap categories and admin-managed rates
- Customer addresses
- Pickup creation, listing and cancellation
- Collector pickup acceptance, status updates and GPS location
- Admin dashboard, pickup and user endpoints
- Socket.IO pickup rooms for live collector location

This is an MVP backend foundation. Production OTP delivery, payment gateway, push notifications, stronger validation, audit logs and hardened security still need to be added.
