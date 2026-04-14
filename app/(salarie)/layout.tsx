import Link from "next/link"

export default function SalarieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border-subtle bg-bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-12">
            <Link href="/" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
              Simulateur
            </Link>
            <nav aria-label="Type de simulateur" className="flex gap-1.5">
              <Link href="/salarie" className="px-3 py-1.5 rounded-full text-xs font-medium border border-border-subtle text-text-secondary hover:text-text-primary transition-all">
                CDI
              </Link>
              <Link href="/portage" className="px-3 py-1.5 rounded-full text-xs font-medium border border-border-subtle text-text-secondary hover:text-text-primary transition-all">
                Portage
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border-subtle py-4 px-4 text-center">
        <p className="text-xs text-text-tertiary">
          Simulateur à but pédagogique · Barème officiel 2026 · Les résultats sont indicatifs
        </p>
      </footer>
    </div>
  )
}
