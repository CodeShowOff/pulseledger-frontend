import Link from "next/link";
import { Home, LogIn, SearchX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-slate-100 px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

      <Card className="relative w-full max-w-2xl border-indigo-100/80 shadow-[0_20px_55px_-28px_rgba(79,70,229,0.45)]">
        <CardHeader className="items-center text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <SearchX className="h-8 w-8" />
          </div>

          <p className="mb-3 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Error 404
          </p>

          <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
            Page not found
          </CardTitle>

          <CardDescription className="max-w-xl text-base leading-relaxed text-slate-600">
            Looks like this link took a detour. The page may have been moved,
            deleted, or the URL might be misspelled.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium !text-white visited:!text-white hover:!text-white shadow-[0_10px_30px_-14px_rgba(79,70,229,0.55)] transition-colors hover:bg-indigo-700"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500">
            Tip: check the URL for typos, or use one of the links above to get
            back on track.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}