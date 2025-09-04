# Coupon Management API

A simple **RESTful API** built with **Express.js** and **Mongoose** for managing coupons.  
This project supports creating, applying, deleting, and generating reports for coupons with validation rules.

## Features

- Create new coupons with:
  - Code
  - Discount percentage
  - Expiry date
  - Maximum usage limit
- Fetch all active coupons
- Apply a coupon with validation:
  - Must exist
  - Not expired
  - Must have remaining usage
- Delete a coupon (soft delete)
- Generate coupon usage reports:
  - Total used
  - Remaining usage
  - Expired status

---

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **http-status** for response codes

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/akash-khan-311/coupons-backend.git
cd coupons-backend
npm install
```

## Create a .env file in the root:

```bash
NODE_ENV=development
DATABASE_URL=your_database_url

```

## Run the server:

```bash
npm run dev
```
