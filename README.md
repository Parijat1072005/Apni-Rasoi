# 🌿 Apni Rasoi

Premium pickle and seasonal food ecommerce — built with MERN stack.

## Stack
- **Frontend**: React 18 + Vite + TailwindCSS + ShadCN
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Auth**: JWT + Refresh Tokens (httpOnly cookies)
- **Storage**: Cloudinary
- **Payment**: Razorpay
- **Deployment**: AWS EC2 + Nginx + PM2

## Local Dev
```bash
# Terminal 1 - Server
cd server && cp .env.example .env  # fill in your values
npm run dev

# Terminal 2 - Client
cd client && npm run dev

# Terminal 3 - Admin
cd admin && npm run dev
```

## Ports
- Client → http://localhost:5173
- Admin  → http://localhost:5174
- Server → http://localhost:5000