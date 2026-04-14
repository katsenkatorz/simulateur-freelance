import Link from "next/link"
import { StatusNav } from "@/components/controls/status-nav"

export default function FreelanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-12">
            <Link href="/" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
              Simulateur
            </Link>
            <StatusNav />
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 px-4 text-center">
        <p className="text-xs text-text-tertiary">
          Simulateur à but pédagogique · Barème officiel 2026 · Les résultats sont indicatifs
        </p>
      </footer>
    </div>
  )
}
