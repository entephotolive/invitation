"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInClient({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");

  return (
    <div className="rounded-3xl border bg-card p-8 shadow-soft">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use Google or email magic link to access your dashboard.
      </p>

      <div className="mt-6 grid gap-3">
        <Button onClick={() => signIn("google", { callbackUrl })} type="button">
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />
          <Button
            variant="secondary"
            onClick={() => signIn("email", { email, callbackUrl })}
            type="button"
            disabled={!email}
          >
            Email me a sign-in link
          </Button>
        </div>
      </div>
    </div>
  );
}

