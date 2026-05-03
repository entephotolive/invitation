import Link from "next/link";
import { SignInClient } from "@/app/(auth)/signin/signin-client";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl = typeof raw === "string" && raw.length > 0 ? raw : "/dashboard";
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
      <SignInClient callbackUrl={callbackUrl} />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        <Link className="underline" href="/">
          Back home
        </Link>
      </p>
    </main>
  );
}

