# FitCoach

This is the frontend application for the **Fit Coach Portal**. Built with Next.js and modern web technologies, it provides a highly responsive, real-time, and interactive user experience for both coaches and clients.

## 🚀 Features

- **Modern UI/UX:** Built with React 19, Next.js 16 (App Router), and Tailwind CSS v4.
- **Progressive Web App (PWA):** Installable on mobile and desktop devices with offline support capabilities via `next-pwa`.
- **State Management:** Efficient client-side state using `zustand` and server-state management with `@tanstack/react-query`.
- **Real-Time Communication:** Integrated `socket.io-client` for live chat, notifications, and instant updates.
- **Form Handling & Validation:** Robust forms powered by `react-hook-form` and schema validation using `zod`.
- **Data Visualization:** Interactive and responsive charts built with `recharts` to track client progress.
- **Animations:** Smooth page transitions and micro-interactions powered by `framer-motion`.
- **Notifications:** Beautiful toast notifications provided by `sonner`.
- **Icons & Typography:** Scalable vector icons via `lucide-react`.

## 🛠️ Tech Stack

- **Framework:** Next.js 16
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State/Data Fetching:** Zustand & TanStack React Query
- **Real-time:** Socket.io Client

## ⚙️ Configuration

Create a `.env.development.local` file in the root of the `frontend` directory with the following variables to point to your backend:

```env
# The relative API path (if using a proxy) or absolute URL
NEXT_PUBLIC_API_URL=/api/v1

# The absolute URL of your backend server
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# The absolute URL of your socket server (usually same as backend)
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

*Note: For production, create a `.env.production` file with your production URLs.*

## 📦 Installation

Ensure you have Node.js (>= 20) installed.

```bash
npm install
```

## 🏗️ Build & Run

### Development Mode

Start the Next.js development server:

```bash
npm run dev
```

### Production Mode

Build the application for production, which includes a type-check step:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

### Additional Scripts

- `npm run type-check`: Run TypeScript type checking.
- `npm run lint`: Run ESLint.
- `npm run analyze`: Run the Next.js bundle analyzer to inspect bundle size.
- `npm run images:compress`: Run the Python script to optimize local image assets.
