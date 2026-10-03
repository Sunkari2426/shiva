# Scrap Mama ♻️

Scrap Mama is a doorstep scrap-pickup platform prototype based on the supplied Product & Technical Requirements.

## Run in GitHub Codespaces

The project uses two processes during local development.

Terminal 1 — API:
```bash
cd /workspaces/shiva/server
cp .env.example .env
npm install
npm run dev
```

Terminal 2 — web app:
```bash
cd /workspaces/shiva
npm install
npm run dev
```

Open forwarded port **5173**. API health is available on forwarded port **4000** at `/api/health`.

The frontend automatically derives the Codespaces API URL from the 5173/4000 forwarded ports when `VITE_API_URL` is blank.

### Stop old ports

If a previous process is holding a port:

```bash
lsof -i :4000 -t | xargs -r kill
lsof -i :5173 -t | xargs -r kill
```

Or inspect first:

```bash
lsof -i :4000
lsof -i :5173
```

Then restart the two terminals.

## Development OTP

With `OTP_MODE=dev`, the development OTP is **123456**. No SMS is sent in dev mode.

Production uses `OTP_MODE=webhook` and requires `OTP_WEBHOOK_URL` (and optionally `OTP_WEBHOOK_TOKEN`) to point to the chosen SMS provider adapter.

## Product workflow

Customer:
`PENDING → ASSIGNED → ACCEPTED → EN_ROUTE → ARRIVED → WEIGHING → PAYMENT_PENDING → COMPLETED`

`CANCELLED` is terminal. Final amount is calculated server-side from actual weight × official admin-managed rate.

Partner:
- accept pickup
- advance operational status
- record actual weights
- share location only during EN_ROUTE/ARRIVED
- wait for customer payment after weighing

Admin:
- dashboard
- pickups
- users/partners
- rates
- payments
- complaints
- ratings
- reports/settings foundations

## Validation and security

- JWT + role-based access control
- OTP request/verification throttling
- API request rate limiting
- Helmet security headers
- Codespaces CORS support
- server-side official-rate pricing
- latitude/longitude validation
- pickup/weight limits
- payment confirmation is customer-controlled
- completed pickup cannot be completed by the partner directly

## CI

GitHub Actions runs:
- frontend production build
- backend Node tests
- backend syntax checks

## Production items requiring provider configuration

The codebase has provider boundaries for:
- real SMS/OTP delivery
- payment gateway / UPI
- map rendering/provider
- push notifications
- distributed rate limiting and audit infrastructure

Provider credentials should be supplied through environment variables; secrets must not be committed.
