# E-Commerce Web Application

This is a Next.js project that serves as a full-stack e-commerce web application. It includes features like user authentication, product listings, filtering, and a shopping cart.

## Features

- **User Authentication**: Sign up, log in, and log out functionality.
- **Product Catalog**: View a list of products.
- **Shopping Cart**: Add/remove items from the cart.
- **Database**: Uses PostgreSQL with Drizzle ORM for database management.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [JWT](https://jwt.io/) with `jose`
- **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query](https://tanstack.com/query/latest)
- **Linting**: [ESLint](https://eslint.org/)
- **TypeScript**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/download/)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/KodeWithKK/astrape.git
    cd astrape
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following variables. Replace the placeholder values with your actual database connection string and a secret for JWT.

    ```env
    DATABASE_URL=postgres://username:password@localhost:5432/database
    JWT_SECRET=your-jwt-secret
    ```

4.  **Run database migrations:**

    This will apply the database schema to your PostgreSQL database.

    ```bash
    npm run db:push
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Creates a production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality.
- `npm run typecheck`: Runs TypeScript compiler to check for type errors.
- `npm run db:generate`: Generates Drizzle ORM migration files.
- `npm run db:migrate`: Applies generated migrations to the database.
- `npm run db:push`: Pushes the schema to the database without generating migration files.
- `npm run db:studio`: Opens the Drizzle Studio to view and manage your database.
