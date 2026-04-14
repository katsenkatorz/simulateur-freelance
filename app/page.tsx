import type { Metadata } from "next"
import { ProfileCards } from "@/components/landing/profile-cards"

export const metadata: Metadata = {
  title: "Simulateur de Rémunération — Où va votre argent ?",
  description: "Visualisez le parcours de chaque euro : coût employeur, cotisations, impôts, net. Freelance, CDI, portage. Barème 2026.",
}

export default function LandingPage() {
  return <ProfileCards />
}
