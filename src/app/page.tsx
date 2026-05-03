import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-3xl border bg-card p-8 shadow-soft md:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Premium invitation websites in minutes
        </div>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Build a beautiful event invitation site — no code.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
          Pick a theme, customize details, upload a cover image and music, then
          share a unique link with QR + WhatsApp.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard">
              Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/event/demo-wedding">View demo event</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

