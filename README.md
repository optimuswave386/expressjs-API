# Express.js REST API

A Node.js / Express 5 backend for a small e-commerce style site. It provides user authentication (JWT), a product catalog, a shopping cart, Stripe payments, order management, and a few content endpoints (quotes, design notes, projects, support requests, email subscriptions). Data is stored in MongoDB via Mongoose, and the app is set up to run locally or as a serverless function on Vercel.

## Features

- **Authentication** – register, login, password reset by email, JWT-protected routes, admin-only routes
- **Products** – CRUD, keyword search, category filter, paginated listing
- **Cart** – add, update, patch quantity, remove, clear, check whether a product is in the cart
- **Payments** – Stripe payment intents and order saving; admins can list all orders
- **Content endpoints** – quotes (including random quote), design notes, CEP projects (with pagination)
- **Support and email** – log support requests, email subscription confirmation via Nodemailer
- **Error handling** – centralized error middleware; stack traces hidden in production
- **Serverless ready** – cached MongoDB connection for Vercel

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js 22.x |
| Framework | Express 5 |
| Database | MongoDB with Mongoose |
| Auth | jsonwebtoken, bcrypt |
| Payments | Stripe |
| Email | Nodemailer, React Email |
| Deployment | Vercel |

## Project Structure

```
.
├── api/
│   └── index.js          # Express app (exported; used by Vercel)
├── server.js             # Local development entry point
├── config/
│   └── dbconnect.js      # Cached MongoDB connection
├── controllers/          # Request handlers
├── routes/               # Route definitions
├── models/               # Mongoose schemas
├── middleware/
│   ├── authHandler.js    # JWT verification + admin check
│   └── errorHandler.js   # Central error handler
├── utils/CustomError.js
├── errorcodes.js
├── src/
│   ├── emails/           # React email template
│   └── assets/images/    # Sample product images
├── vercel.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 22.x
- A MongoDB database (local or Atlas)
- (Optional) Stripe account and SMTP credentials for payments and email

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Local server port (default `3000`) |
| `MONGODB_URI` | MongoDB connection string (required) |
| `MONGODB_DB` | Database name (required) |
| `MONGODB_USERNAME` / `MONGODB_PASSWORD` | Optional credentials, passed separately from the URI |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `SMTP_HOST` | SMTP server host |
| `SMTP_EMAIL` | Sender email address |
| `SMTP_APP_PASSWORD` | SMTP / app password |
| `SMTP_PORT` | SMTP port (default `587`) |
| `SMTP_SECURE` | `true` for SSL (port 465), otherwise `false` |
| `CLIENT_URL` | Frontend URL used in password reset links (default `http://localhost:5173`) |
| `NODE_ENV` | Set to `production` to hide stack traces and internal error messages |

> Never commit your `.env` file. It contains secrets.

### Running the Server

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

## API Reference

Protected routes require the header `Authorization: Bearer <token>`, where the token is returned by `/user/login`.

### General

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Health / welcome message |
| POST | `/subscribe-with-email` | Subscribe an email (`{ "SubscriberEmail": "..." }`) and send a confirmation |
| POST | `/log-support-request` | Save a support request (`contactEmail`, `issueDescription`) |

### Users – `/user`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/user/register` | – | Register a new user |
| POST | `/user/login` | – | Log in and receive a JWT (expires in 1 hour) |
| POST | `/user/forgot-password` | – | Email a password reset link |
| POST | `/user/reset-password` | – | Set a new password using the emailed token |
| POST | `/user/auth/:email` | – | Verify an authorization token |
| GET | `/user/is-admin` | Token | Check whether the current user is an admin |
| POST | `/user/profile/:email` | Token | Get the user's profile |
| GET | `/user/` | – | List users |
| POST | `/user/` | – | Create a user |
| GET | `/user/:id` | – | Get a user by ID |
| PUT | `/user/:id` | – | Update a user |
| DELETE | `/user/:id` | – | Delete a user |

### Products – `/product`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/product/` | Get all products |
| GET | `/product/getallproductsfromdatabase` | Get products from the database |
| GET | `/product/getallproductsfromdatabase/:itemsperpage` | Paginated products |
| GET | `/product/:id` | Get a product by ID |
| GET | `/product/search/:keyword` | Search products |
| GET | `/product/category/:category` | Filter by category |
| POST | `/product/` | Add a product |
| PUT | `/product/:id` | Update a product |
| DELETE | `/product/:id` | Remove a product |

### Cart – `/cart`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cart/` | Get all cart items |
| GET | `/cart/:id` | Get a cart item by ID |
| GET | `/cart/check/:productId` | Check if a product is already in the cart |
| POST | `/cart/` | Add an item |
| PUT | `/cart/:id` | Update an item |
| PATCH | `/cart/:id` | Update item quantity |
| DELETE | `/cart/:id` | Remove an item |
| DELETE | `/cart/` | Clear the cart |

### Payments – `/payment`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/payment/create-payment-intent` | Token | Create a Stripe payment intent |
| POST | `/payment/order` | Token | Save an order |
| GET | `/payment/orders` | Token + Admin | List all orders |

### Quotes

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/get-quote` | Get quotes |
| GET | `/get-quote/:quoteid` | Get a quote by ID |
| GET | `/randomquote` | Get a random quote |
| POST | `/insert-quote` | Add a quote |
| PUT | `/update-quote/:quoteid` | Update a quote |
| DELETE | `/delete-quote/:quoteid` | Delete a quote |

### Design Notes – `/dn`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dn/getNotes` | Get all notes |
| GET | `/dn/getNotes/:itemsperpage` | Paginated notes |

### CEP Projects – `/cep`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cep/` | Get projects |
| GET | `/cep/getProjects` | Get projects from the database |
| GET | `/cep/getProjects/:itemsperpage` | Paginated projects |

## Error Handling

Errors are returned as JSON:

```json
{ "message": "The input provided is invalid." }
```

In non-production environments the response also includes a `stackTrace` field. In production, 5xx errors return a generic message so internals are never leaked.

## Deployment (Vercel)

The project is configured for Vercel: `vercel.json` rewrites all requests to `api/index.js`, which exports the Express app.

1. Import the repository into Vercel.
2. Add the environment variables from the table above in the project settings.
3. Deploy.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the server with Node |
| `npm run dev` | Start the server with nodemon |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
