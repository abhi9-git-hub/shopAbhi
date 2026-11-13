# ShopAbhi

ShopAbhi is a MERN e-commerce application with a React storefront, an Express API, MongoDB persistence, an admin dashboard, Cloudinary image uploads, and Razorpay checkout.

## Requirements

- Node.js and npm
- MongoDB (local or hosted)

## Local setup

1. Install dependencies from the project root:

   ```bash
   npm run install-all
   ```

2. Set local configuration in `backend/.env`. This file contains secrets, is ignored by Git, and must not be committed. At minimum, set `MONGO_URI` and `JWT_SECRET`. Set `EMAIL_USER` and `EMAIL_PASS` for registration emails; without them, registration currently returns an error. For product image uploads, configure Cloudinary with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. For checkout payments, configure Razorpay with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. On a hosting provider, set these values in its environment-variable settings instead of uploading `.env`.

3. Start the frontend and backend:

   ```bash
   npm run dev
   ```

   The frontend runs at `http://localhost:3000`; the API runs at `http://localhost:5000`.

To run only the backend, use `npm start` from the project root. To create a frontend production build, use `npm run build`.

## Seed data

Run `npm run seed` from the project root to create the sample admin and products. **This command deletes existing users and products before seeding.**

The seed admin is `admin@shopabhi.com` with password `password123`. This is for local development only; change or remove these credentials before using a deployed database.

## Deploy as one service

The backend serves the compiled React app when `NODE_ENV=production`.

- Build command: `npm run render-build`
- Start command: `npm start`
- Set `NODE_ENV=production`, `MONGO_URI`, and a strong `JWT_SECRET` in the hosting provider's environment settings.
- Set `EMAIL_USER` and `EMAIL_PASS` if users need to register. For product image uploads, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. For checkout payments, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

The build command installs the root, backend, and frontend dependencies, then builds the frontend. The backend serves that build and handles `/api` requests from the same origin.
