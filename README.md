
# 🧮 Full-Stack Calculator App

A beautiful, modern calculator application built with Next.js. It supports real-time calculations, dark/light mode, and persistent history for authenticated users.

## ✨ Features

* **Core Calculator**: Handles basic arithmetic with a clean, responsive UI inspired by modern design systems.
* **Authentication**: Integrated with **Clerk** for secure user sign-in and sign-up.
* **Persistent History**:
* **Authenticated Users**: Calculations are saved to a PostgreSQL database via Prisma.
* **Guest Users**: Calculations are stored in `sessionStorage` and can be synced to the cloud upon signing in.


* **Theme Support**: Smooth transition between Dark and Light modes using Framer Motion animations.
* **Responsive Design**: Built with Tailwind CSS 4.0 for a mobile-first experience.

## 🚀 Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
* **Authentication**: [Clerk](https://clerk.com/)
* **Database ORM**: [Prisma](https://www.prisma.io/)
* **Database**: PostgreSQL
* **Language**: TypeScript

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd full-stack-calculator

```


2. **Install dependencies:**
```bash
npm install

```


3. **Environment Variables:**
Create a `.env` file in the root directory and add your credentials:
```env
DATABASE_URL="your_postgresql_connection_string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key

```


4. **Database Setup:**
Initialize your database schema using Prisma:
```bash
npx prisma generate
npx prisma db push

```


5. **Run the development server:**
```bash
npm run dev

```


Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the app.

## 📂 Project Structure

* `app/api/calculations/`: API endpoints for fetching, saving, and deleting calculation history.
* `app/components/calculator.tsx`: The main calculator logic, UI, and history management.
* `app/page.tsx`: The main entry point featuring the theme toggle and Clerk auth buttons.
* `lib/prisma.ts`: Singleton Prisma client configuration.
* `prisma/schema.prisma`: Database model definition for `Calculation`.

## 📡 API Endpoints

* `GET /api/calculations`: Fetch the last 100 calculations for the logged-in user.
* `POST /api/calculations`: Save a new calculation (Expression + Result).
* `POST /api/calculations/sync`: Bulk sync `sessionStorage` history to the database after login.
* `DELETE /api/calculations`: Clear all history for the current user.

## 📜 License

This project is bootstrapped with `create-next-app`. Refer to the repository for specific licensing information.
