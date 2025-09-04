## Installation

1. Clone the repository:

```bash
git clone https://github.com/akash-khan-311/loopnest-backend.git
cd loopnest-backend
npm install
```

## Create a .env file in the root:

```bash
NODE_ENV=development
DATABASE_URL=your_database_url
BASE_URL=http://localhost:5000

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Run the server:

```bash
npm run dev
```
