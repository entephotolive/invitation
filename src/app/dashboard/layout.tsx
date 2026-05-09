import Link from "next/link";


export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link className="font-semibold" href="/dashboard">
              Invitations
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
              <Link className="hover:text-foreground" href="/dashboard/events">
                Events
              </Link>
              <Link className="hover:text-foreground" href="/dashboard/events/new">
                Create
              </Link>
            </nav>
          </div>
          
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

