import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock, Trophy, CheckCircle, XCircle, Lock, ChevronRight } from 'lucide-react'
import { QUIZZES, LEADERBOARD } from '@/features/simulations/quizData'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSubscription } from '@/hooks/useSubscription'
import type { Quiz, QuizQuestion } from '@/types'

export function SimulationsPage() {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const { isPremium } = useSubscription()

  const startQuiz = (quiz: Quiz) => {
    if (quiz.isPremium && !isPremium) return
    setActiveQuiz(quiz)
    setCurrentQ(0)
    setAnswers([])
    setSelected(null)
    setShowResult(false)
  }

  const submitAnswer = () => {
    if (selected === null || !activeQuiz) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    if (!activeQuiz) return
    setShowExplanation(false)
    setSelected(null)
    if (currentQ + 1 >= activeQuiz.questions.length) {
      setShowResult(true)
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  const score = answers.reduce((acc, ans, i) => {
    return acc + (ans === activeQuiz?.questions[i]?.correctIndex ? 1 : 0)
  }, 0)

  const resetQuiz = () => {
    setActiveQuiz(null)
    setShowResult(false)
    setCurrentQ(0)
    setAnswers([])
  }

  if (showResult && activeQuiz) {
    const pct = Math.round((score / activeQuiz.questions.length) * 100)
    return (
      <div className="h-[calc(100dvh-5rem)] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <Trophy size={48} className="text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-1">{pct}%</h2>
          <p className="text-sm text-text-secondary mb-4">
            {score} de {activeQuiz.questions.length} corretas
          </p>
          <Badge variant={pct >= 70 ? 'accent' : 'warning'}>
            {pct >= 90 ? 'Excelente!' : pct >= 70 ? 'Bom!' : 'Continue estudando'}
          </Badge>
          <Button onClick={resetQuiz} className="w-full mt-6">
            Voltar aos simulados
          </Button>
        </motion.div>
      </div>
    )
  }

  if (activeQuiz && !showResult) {
    const question: QuizQuestion = activeQuiz.questions[currentQ]
    const isCorrect = selected === question.correctIndex

    return (
      <div className="h-[calc(100dvh-5rem)] flex flex-col">
        <div className="glass-strong safe-top px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold truncate">{activeQuiz.title}</h2>
            <button onClick={resetQuiz} className="text-xs text-text-muted">Sair</button>
          </div>
          <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-accent rounded-full"
              animate={{ width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1">
            Questão {currentQ + 1} de {activeQuiz.questions.length}
          </p>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <h3 className="text-base font-semibold mb-6 leading-relaxed">{question.question}</h3>
          <div className="space-y-2">
            {question.options.map((opt, i) => {
              let style = 'glass hover:bg-white/6'
              if (showExplanation) {
                if (i === question.correctIndex) style = 'bg-accent/20 border border-accent/40 text-accent'
                else if (i === selected) style = 'bg-red-500/15 border border-red-500/30 text-red-400'
              } else if (selected === i) {
                style = 'bg-accent/15 border border-accent/30 text-accent'
              }

              return (
                <motion.button
                  key={i}
                  whileTap={!showExplanation ? { scale: 0.98 } : undefined}
                  onClick={() => !showExplanation && setSelected(i)}
                  disabled={showExplanation}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all ${style}`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {showExplanation && i === question.correctIndex && (
                    <CheckCircle size={16} className="inline ml-2 text-accent" />
                  )}
                  {showExplanation && i === selected && i !== question.correctIndex && (
                    <XCircle size={16} className="inline ml-2 text-red-400" />
                  )}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass rounded-xl p-4 border-l-2 border-accent"
              >
                <p className="text-xs font-semibold text-accent mb-1">
                  {isCorrect ? '✅ Correto!' : '❌ Incorreto'}
                </p>
                <p className="text-xs text-text-secondary">{question.explanation}</p>
                <p className="text-[10px] text-text-muted mt-2">
                  📌 Fonte: {question.sourceReference}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 pb-4 safe-bottom">
          {!showExplanation ? (
            <Button onClick={submitAnswer} disabled={selected === null} className="w-full">
              Confirmar resposta
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="w-full">
              {currentQ + 1 >= activeQuiz.questions.length ? 'Ver resultado' : 'Próxima questão'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar">
      <header className="glass-strong safe-top px-4 py-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Brain size={20} className="text-accent" />
          Simulados
        </h1>
        <p className="text-xs text-text-muted mt-1">Teste seus conhecimentos com correção automática</p>
      </header>

      <div className="px-4 py-3 space-y-3">
        {QUIZZES.map((quiz, i) => {
          const locked = quiz.isPremium && !isPremium
          return (
            <motion.button
              key={quiz.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={!locked ? { scale: 0.98 } : undefined}
              onClick={() => startQuiz(quiz)}
              className={`w-full glass rounded-2xl p-4 text-left ${locked ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{quiz.title}</h3>
                    {quiz.isPremium && <Badge variant="premium">Premium</Badge>}
                  </div>
                  <p className="text-xs text-text-muted mt-1">{quiz.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <Brain size={10} /> {quiz.questions.length} questões
                    </span>
                    {quiz.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {Math.floor(quiz.timeLimit / 60)} min
                      </span>
                    )}
                  </div>
                </div>
                {locked ? <Lock size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-amber-400" />
          Ranking
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          {LEADERBOARD.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 ${
                entry.name === 'Você' ? 'bg-accent/5' : ''
              }`}
            >
              <span className="text-lg w-8 text-center">{entry.badge || entry.rank}</span>
              <span className="flex-1 text-sm font-medium">{entry.name}</span>
              <span className="text-sm font-bold text-accent">{entry.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
