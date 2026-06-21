import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react'
import { usePersonalization } from '@/contexts/PersonalizationContext'
import { SubscriptionPlansModal } from '@/components/subscription/SubscriptionPlansModal'
import {
  KNOWLEDGE_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEARNING_PREFERENCE_OPTIONS,
  ONBOARDING_STEPS,
} from './onboardingData'
import type { KnowledgeLevel, UserGoal, PriorExperience, LearningPreference } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function optionButtonClass(selected: boolean, className?: string) {
  return cn(
    'glass rounded-2xl text-left transition-all border-2',
    selected
      ? 'border-accent bg-accent/15 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
      : 'border-white/10 hover:border-white/25',
    className
  )
}

export function OnboardingWizard() {
  const { completeOnboarding, toggleLearningPreference } = usePersonalization()
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState<KnowledgeLevel>('iniciante')
  const [goal, setGoal] = useState<UserGoal>('legislacao_cac')
  const [experience, setExperience] = useState<PriorExperience>('nenhuma')
  const [prefs, setPrefs] = useState<LearningPreference[]>(['texto', 'resumos'])
  const [showPlansModal, setShowPlansModal] = useState(false)

  const totalSteps = ONBOARDING_STEPS.length
  const progress = ((step + 1) / totalSteps) * 100

  const togglePref = (pref: LearningPreference) => {
    setPrefs((prev) => {
      if (prev.includes(pref)) {
        const next = prev.filter((p) => p !== pref)
        return next.length ? next : prev
      }
      return [...prev, pref]
    })
    toggleLearningPreference(pref)
  }

  const handleFinish = async () => {
    setShowPlansModal(true)
  }

  const handleContinueFree = async () => {
    await completeOnboarding({
      knowledgeLevel: level,
      mainGoal: goal,
      priorExperience: experience,
      learningPreferences: prefs,
    })
    setShowPlansModal(false)
  }

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0f]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/revolver.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1a3a]/90 to-black/95 pointer-events-none" aria-hidden />

      <div className="relative z-10 flex flex-col min-h-dvh safe-top safe-bottom">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Passo {step + 1} de {totalSteps}
            </span>
            <Sparkles size={16} className="text-accent" />
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-accent rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="text-center pt-8">
                  <div className="w-20 h-20 rounded-3xl gradient-accent mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <Sparkles size={36} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-3 text-gradient">Bem-vindo ao Sgt Vitor</h1>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                    Vamos personalizar sua experiência de aprendizado sobre legislação, segurança e
                    treinamento teórico — 100% educacional.
                  </p>
                </div>
              )}

              {step === 1 && (
                <StepSelect
                  title="Qual seu nível de conhecimento?"
                  subtitle="A IA adaptará linguagem e profundidade das respostas"
                  options={KNOWLEDGE_LEVEL_OPTIONS.map((o) => ({
                    id: o.id,
                    label: `${o.emoji} ${o.label}`,
                    desc: o.desc,
                  }))}
                  selected={level}
                  onSelect={(id) => setLevel(id as KnowledgeLevel)}
                />
              )}

              {step === 2 && (
                <StepSelect
                  title="Qual seu objetivo principal?"
                  subtitle="Conteúdo e sugestões serão alinhados ao seu foco"
                  options={GOAL_OPTIONS.map((o) => ({
                    id: o.id,
                    label: `${o.emoji} ${o.label}`,
                    desc: o.desc,
                  }))}
                  selected={goal}
                  onSelect={(id) => setGoal(id as UserGoal)}
                />
              )}

              {step === 3 && (
                <StepSelect
                  title="Experiência prévia"
                  subtitle="Nos ajuda a calibrar exemplos e referências"
                  options={EXPERIENCE_OPTIONS.map((o) => ({
                    id: o.id,
                    label: `${o.emoji} ${o.label}`,
                  }))}
                  selected={experience}
                  onSelect={(id) => setExperience(id as PriorExperience)}
                />
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-1">Preferências de aprendizado</h2>
                  <p className="text-sm text-text-secondary mb-6">Selecione um ou mais formatos</p>
                  <div className="grid grid-cols-2 gap-3">
                    {LEARNING_PREFERENCE_OPTIONS.map((opt) => {
                      const active = prefs.includes(opt.id)
                      return (
                        <motion.button
                          key={opt.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => togglePref(opt.id)}
                          className={optionButtonClass(active, 'p-4')}
                        >
                          <span className="text-2xl">{opt.emoji}</span>
                          <p className="text-sm font-semibold mt-2">{opt.label}</p>
                          {active && <Check size={14} className="text-accent mt-1" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center pt-8">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-accent" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Tudo pronto!</h2>
                  <p className="text-sm text-text-secondary mb-6">
                    Sua IA está configurada para nível{' '}
                    <strong className="text-accent">
                      {KNOWLEDGE_LEVEL_OPTIONS.find((l) => l.id === level)?.label}
                    </strong>{' '}
                    com foco em{' '}
                    <strong className="text-accent">
                      {GOAL_OPTIONS.find((g) => g.id === goal)?.label}
                    </strong>
                    .
                  </p>
                  <div className="glass rounded-2xl p-4 text-left text-xs text-text-secondary space-y-1">
                    <p>✓ Respostas personalizadas por perfil</p>
                    <p>✓ Histórico inteligente de aprendizado</p>
                    <p>✓ Notificações educacionais</p>
                    <p>✓ OCR e consultoria premium disponíveis</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6 pt-2 flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={back} className="flex-1">
              <ChevronLeft size={16} /> Voltar
            </Button>
          )}
          {step < 4 && (
            <Button onClick={next} className="flex-1">
              Continuar <ChevronRight size={16} />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={next} className="flex-1">
              Revisar <ChevronRight size={16} />
            </Button>
          )}
          {step === 5 && (
            <Button onClick={handleFinish} className="flex-1">
              Iniciar experiência <Sparkles size={16} />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPlansModal && (
          <SubscriptionPlansModal
            onContinueFree={handleContinueFree}
            onClose={() => setShowPlansModal(false)}
            subtitle="Seu perfil está pronto. Escolha um plano ou comece gratuitamente agora."
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StepSelect({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: {
  title: string
  subtitle: string
  options: { id: string; label: string; desc?: string }[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-sm text-text-secondary mb-6">{subtitle}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(opt.id)}
            className={optionButtonClass(selected === opt.id, 'w-full p-4')}
          >
            <p className="text-sm font-semibold">{opt.label}</p>
            {opt.desc && <p className="text-xs text-text-muted mt-1">{opt.desc}</p>}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
