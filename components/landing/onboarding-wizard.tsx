"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Briefcase, Users, ArrowRight, Sparkles } from "lucide-react"

const CA_PRESETS = [
  { value: 30_000, label: "30k", desc: "Débutant" },
  { value: 50_000, label: "50k", desc: "Intermédiaire" },
  { value: 100_000, label: "100k", desc: "Confirmé" },
  { value: 200_000, label: "200k", desc: "Senior" },
  { value: 500_000, label: "500k", desc: "Expert / Agence" },
]

const PARTS_OPTIONS = [
  { value: 1, label: "1", desc: "Célibataire" },
  { value: 1.5, label: "1.5", desc: "Couple (1 revenu)" },
  { value: 2, label: "2", desc: "Couple (2 revenus)" },
  { value: 2.5, label: "2.5", desc: "Couple + 1 enfant" },
  { value: 3, label: "3", desc: "Couple + 2 enfants" },
]

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<"salarie" | "freelance" | null>(null)
  const [ca, setCa] = useState(100_000)
  const [parts, setParts] = useState(1)

  const handleFinish = useCallback(() => {
    localStorage.setItem("sim-onboarded", "1")
    if (profile === "salarie") {
      router.push(`/salarie?ca=${ca}&parts=${parts}`)
    } else {
      router.push(`/micro?ca=${ca}&parts=${parts}`)
    }
    onComplete()
  }, [profile, ca, parts, router, onComplete])

  const handleSkip = useCallback(() => {
    localStorage.setItem("sim-onboarded", "1")
    onComplete()
  }, [onComplete])

  const steps = [
    // Step 0: Profile choice
    {
      title: "Vous êtes...",
      subtitle: "Choisissez votre profil pour personnaliser la simulation",
      content: (
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {([
            { id: "salarie" as const, icon: User, label: "Salarié(e)", desc: "Je veux connaître mon coût réel", color: "#6366f1" },
            { id: "freelance" as const, icon: Briefcase, label: "Indépendant(e)", desc: "Je veux comparer les statuts", color: "#60a5fa" },
          ]).map((p) => (
            <button
              key={p.id}
              onClick={() => { setProfile(p.id); setStep(1) }}
              className={cn(
                "flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                "hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]",
                profile === p.id
                  ? "border-accent bg-accent/10"
                  : "border-border-default bg-bg-card hover:border-border-strong"
              )}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${p.color} 12%, transparent)` }}
              >
                <p.icon size={24} style={{ color: p.color }} />
              </div>
              <span className="font-semibold text-text-primary">{p.label}</span>
              <span className="text-xs text-text-tertiary text-center">{p.desc}</span>
            </button>
          ))}
        </div>
      ),
    },
    // Step 1: CA
    {
      title: "Votre chiffre d'affaires annuel ?",
      subtitle: profile === "salarie" ? "Votre salaire brut annuel" : "Estimation de votre CA HT annuel",
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
          {CA_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setCa(p.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                "hover:scale-[1.02] active:scale-[0.98]",
                ca === p.value
                  ? "border-accent bg-accent/10"
                  : "border-border-default bg-bg-card hover:border-border-strong"
              )}
            >
              <span className="font-mono font-bold text-lg text-text-primary">{p.label}€</span>
              <span className="text-[11px] text-text-tertiary">{p.desc}</span>
            </button>
          ))}
        </div>
      ),
    },
    // Step 2: Parts fiscales
    {
      title: "Votre situation familiale",
      subtitle: "Le nombre de parts fiscales impacte votre impôt sur le revenu",
      content: (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {PARTS_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setParts(p.value)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left",
                "hover:scale-[1.01] active:scale-[0.99]",
                parts === p.value
                  ? "border-accent bg-accent/10"
                  : "border-border-default bg-bg-card hover:border-border-strong"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0",
                parts === p.value ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary"
              )}>
                {p.label}
              </div>
              <span className="text-sm text-text-primary">{p.desc}</span>
            </button>
          ))}
        </div>
      ),
    },
  ]

  const currentStep = steps[step]
  const canNext = step === 0 ? profile !== null : true
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i <= step ? "bg-accent w-8" : "bg-border-default w-4"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">{currentStep.title}</h2>
          <p className="text-sm text-text-secondary">{currentStep.subtitle}</p>
        </div>

        <div className="w-full flex justify-center mb-8">
          {currentStep.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              Retour
            </button>
          )}
          {step > 0 && (
            <button
              onClick={isLast ? handleFinish : () => setStep(step + 1)}
              disabled={!canNext}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer",
                "bg-accent text-white hover:bg-accent-hover active:scale-[0.97]",
                !canNext && "opacity-40 cursor-not-allowed"
              )}
            >
              {isLast ? (
                <>
                  <Sparkles size={16} />
                  Voir ma simulation
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="mt-6 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          Passer et explorer librement
        </button>
      </div>
    </div>
  )
}
