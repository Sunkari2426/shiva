# Scrap Mama API

Node.js + Express + MongoDB + Socket.IO backend for the Scrap Mama platform.

## Run in Codespaces

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The API listens on port **4000**.

Health:
`GET /api/health`

Development OTP:
`OTP_MODE=dev` returns development OTP **123456** in the API response.

Production OTP:
`OTP_MODE=webhook` requires:
- `OTP_WEBHOOK_URL`
- optional `OTP_WEBHOOK_TOKEN`

The webhook receives JSON:
`{ "phone": "...", "otp": "123456" }`

## Test

```bash
npm test
```

Tests currently cover the documented Pickup lifecycle/model requirements. CI also runs syntax checks.

## Security

The API includes:
- JWT/RBAC
- OTP throttling and cleanup
- API rate limiting
- Helmet
- CORS validation
- input validation
- server-side official scrap-rate calculation
- operational-only collector location updates

Production still needs the selected SMS/payment/map/push providers and distributed infrastructure configuration.
