'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/store/user-store'
import { supabase } from '@/lib/supabase'
import { POINTS_RULES, ACHIEVEMENTS, type AchievementType } from '@/lib/constants'
import type { Tables } from '@/lib/database.types'
import {
  shuffleArray,
  calculateQuestionXp,
  calculateStreakBonus,
  calculateEndBonuses,
  checkAndAwardAchievements,
  persistTestCompletion,
  type QuestionOption,
} from '@/lib/test-utils'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen, Trophy, Flame, ArrowLeft } from 'lucide-react'

type Phase = 'loading' | 'error' | 'question' | 'feedback' | 'second_try' | 'feedback_2' | 'results'

interface AnswerRecord {
  questionId: string
  selectedOptionId: string
  isCorrect: boolean
  attemptNumber: 1 | 2
  xpEarned: number
  questionText: string
  correctOptionId: string
  explanation: string | null
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)

  const [phase, setPhase] = useState<Phase>('loading')
  const [moduleName, setModuleName] = useState('')
  const [questions, setQuestions] = useState<Tables<'questions'>[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attemptId, setAttemptId] = useState('')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [totalXp, setTotalXp] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreakInSession, setMaxStreakInSession] = useState(0)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const currentQuestion = questions[currentIndex]
  const rawOptions = (currentQuestion?.options as unknown as QuestionOption[]) ?? []
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([])
  const options = shuffledOptions.length > 0 ? shuffledOptions : rawOptions
  const progressPct = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0

  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!user || !moduleId || loaded) return
    setLoaded(true)

    async function load() {
      const { data: mod } = await supabase.from('modules').select('title').eq('id', moduleId).single()
      if (mod) setModuleName(mod.title)

      const { data: qs, error } = await supabase.from('questions').select('*').eq('module_id', moduleId)

      if (error || !qs || qs.length === 0) { setPhase('error'); return }

      const filtered = qs.filter((q) => q.roles.length === 0 || q.roles.includes(user!.role))
      if (filtered.length === 0) { setPhase('error'); return }

      const shuffled = shuffleArray(filtered)
      setQuestions(shuffled)

      const { data: attempt } = await supabase
        .from('test_attempts')
        .insert({ user_id: user!.id, module_id: moduleId, total_questions: shuffled.length })
        .select().single()

      if (attempt) setAttemptId(attempt.id)
      setStreak(user!.current_streak)
      setMaxStreakInSession(user!.current_streak)
      setPhase('question')
    }

    load()
  }, [user, moduleId, loaded])

  const submitAnswer = useCallback(async (attemptNumber: 1 | 2) => {
    if (!selectedOptionId || !currentQuestion || !user) return
    setSaving(true)
    const isCorrect = selectedOptionId === currentQuestion.correct_option_id
    const xpEarned = calculateQuestionXp(attemptNumber, isCorrect)
    let newStreak = streak
    if (isCorrect) newStreak = streak + 1
    else if (attemptNumber === 2) newStreak = 0
    const streakBonus = isCorrect ? calculateStreakBonus(streak, newStreak) : 0
    const questionTotalXp = xpEarned + streakBonus
    setStreak(newStreak)
    setMaxStreakInSession((prev) => Math.max(prev, newStreak))
    setTotalXp((prev) => prev + questionTotalXp)
    if (isCorrect) setCorrectCount((prev) => prev + 1)
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, selectedOptionId, isCorrect, attemptNumber, xpEarned: questionTotalXp, questionText: currentQuestion.text, correctOptionId: currentQuestion.correct_option_id, explanation: currentQuestion.explanation }])
    await supabase.from('test_answers').insert({ attempt_id: attemptId, question_id: currentQuestion.id, selected_option_id: selectedOptionId, is_correct: isCorrect, attempt_number: attemptNumber, xp_earned: questionTotalXp })
    if (!isCorrect && attemptNumber === 2) supabase.from('questions').update({ error_count: (currentQuestion.error_count ?? 0) + 1 }).eq('id', currentQuestion.id).then()
    setSaving(false)
    setPhase(attemptNumber === 1 ? 'feedback' : 'feedback_2')
  }, [selectedOptionId, currentQuestion, user, streak, attemptId])

  const handleNext = useCallback(async () => {
    const lastAnswer = answers[answers.length - 1]
    if (phase === 'feedback' && lastAnswer && !lastAnswer.isCorrect) { setSelectedOptionId(null); setShuffledOptions(shuffleArray([...rawOptions])); setPhase('second_try'); return }
    if (currentIndex < questions.length - 1) { setCurrentIndex((prev) => prev + 1); setSelectedOptionId(null); setShuffledOptions([]); setPhase('question') }
    else await finishTest()
  }, [phase, answers, currentIndex, questions.length])

  const finishTest = async () => {
    if (!user) return
    setSaving(true)
    const { bonus } = calculateEndBonuses(correctCount, questions.length)
    const finalXp = totalXp + bonus
    const updatedUser = await persistTestCompletion(user.id, attemptId, correctCount, questions.length, finalXp, streak, maxStreakInSession, user.xp, user.max_streak)
    if (updatedUser) setUser(updatedUser)
    const awarded = await checkAndAwardAchievements(user.id, { correctCount, totalQuestions: questions.length, maxStreak: Math.max(maxStreakInSession, user.max_streak) })
    setNewAchievements(awarded)
    setTotalXp(finalXp)
    setSaving(false)
    setPhase('results')
  }

  const handleRetake = () => { window.location.reload() }

  if (!user) return null

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-[#2D46B9] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[0.875rem] text-[#6B7280]">Загрузка вопросов...</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl border border-[#E2E5F0] shadow-sm max-w-md w-full p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-[1.125rem] font-bold text-[#1A2340] mt-4">Вопросы не найдены</h2>
          <p className="text-[0.875rem] text-[#6B7280] mt-2">Для данного модуля и вашей роли пока нет вопросов.</p>
          <Link href="/modules">
            <Button className="mt-5 bg-[#2D46B9] hover:bg-[#233A9E] rounded-lg font-semibold">К модулям</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
    const { bonus } = calculateEndBonuses(correctCount, questions.length)
    return (
      <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Result banner */}
        <div className="gpb-gradient rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white text-center relative overflow-hidden">
          <Trophy className="w-10 h-10 sm:w-14 sm:h-14 mx-auto text-white/80" />
          <h1 className="text-[1.25rem] sm:text-[1.75rem] font-extrabold mt-3 tracking-tight">Тест завершён!</h1>
          <p className="text-white/60 mt-1 text-[0.8125rem] sm:text-[0.875rem]">{moduleName}</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div>
              <p className="text-[1.5rem] sm:text-[2rem] font-extrabold">{pct}%</p>
              <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/50">Результат</p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-[1.5rem] sm:text-[2rem] font-extrabold">{correctCount}/{questions.length}</p>
              <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/50">Правильных</p>
            </div>
            <div>
              <p className="text-[1.5rem] sm:text-[2rem] font-extrabold">+{totalXp}</p>
              <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/50">баллов</p>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="bg-white rounded-xl border border-[#E2E5F0] shadow-sm p-6">
          <h3 className="font-bold text-[#1A2340] text-[1rem] mb-4">Начисление баллов</h3>
          <div className="space-y-3 text-[0.875rem]">
            <div className="flex justify-between"><span className="text-[#6B7280]">Правильные ответы</span><span className="font-bold text-[#1A2340]">+{totalXp - bonus} б.</span></div>
            <div className="h-px bg-[#E2E5F0]" />
            <div className="flex justify-between"><span className="text-[#6B7280]">Бонус за завершение модуля</span><span className="font-bold text-[#1A2340]">+{POINTS_RULES.MODULE_COMPLETE} б.</span></div>
            {correctCount === questions.length && (<><div className="h-px bg-[#E2E5F0]" /><div className="flex justify-between text-[#2D46B9]"><span className="font-semibold">Бонус за 100%</span><span className="font-bold">+{POINTS_RULES.PERFECT_MODULE} б.</span></div></>)}
          </div>
        </div>

        {newAchievements.length > 0 && (
          <div className="bg-white rounded-xl border-l-[3px] border-l-[#2D46B9] border border-[#E2E5F0] shadow-sm p-6">
            <h3 className="font-bold text-[#2D46B9] text-[1rem] mb-3">Новые значки!</h3>
            <div className="flex flex-wrap gap-3">
              {newAchievements.map((type) => { const ach = ACHIEVEMENTS[type as AchievementType]; return ach ? (
                <div key={type} className="flex items-center gap-2.5 p-3 bg-[#EEF0F8] rounded-lg">
                  <span className="text-[1.5rem]">{ach.icon}</span>
                  <div><p className="text-[0.8125rem] font-bold text-[#2D46B9]">{ach.name}</p><p className="text-[0.6875rem] text-[#6B7280]">{ach.description}</p></div>
                </div>) : null })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleRetake} variant="outline" className="flex-1 gap-2 border-[#2D46B9]/25 text-[#2D46B9] hover:bg-[#2D46B9] hover:text-white rounded-lg font-semibold h-11">
            <RotateCcw className="w-4 h-4" /> Пересдать
          </Button>
          <Link href="/modules" className="flex-1">
            <Button className="w-full gap-2 bg-[#2D46B9] hover:bg-[#233A9E] rounded-lg font-semibold h-11">
              <BookOpen className="w-4 h-4" /> К модулям
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ============ QUESTION / FEEDBACK ============
  const isQuestion = phase === 'question' || phase === 'second_try'
  const isFeedback = phase === 'feedback' || phase === 'feedback_2'
  const lastAnswer = answers[answers.length - 1]

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <Link href="/modules" className="text-[0.8125rem] text-[#6B7280] hover:text-[#2D46B9] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> К модулям
          </Link>
          <h1 className="text-[1rem] sm:text-[1.25rem] font-extrabold text-[#1A2340] mt-1 tracking-tight">{moduleName}</h1>
        </div>
        <div className="flex items-center gap-2.5">
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[0.75rem] font-bold">
              <Flame className="w-3.5 h-3.5" /> {streak}
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EEF0F8] text-[#2D46B9] text-[0.75rem] font-bold">
            +{totalXp} б.
          </span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-[0.8125rem] mb-1.5">
          <span className="text-[#6B7280]">Вопрос {currentIndex + 1} из {questions.length}</span>
          <span className="text-[#2D46B9] font-bold">{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#EEF0F8] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2D46B9] to-[#5B7BF5] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {phase === 'second_try' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[0.875rem] text-amber-800 font-semibold">
          Ответ неверный. У вас есть вторая попытка!
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-xl border border-[#E2E5F0] shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2D46B9] flex items-center justify-center text-white text-[0.8125rem] font-bold shrink-0 mt-0.5">{currentIndex + 1}</div>
          <p className="text-[0.9375rem] sm:text-[1.0625rem] font-semibold text-[#1A2340] leading-relaxed">{currentQuestion?.text}</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2 sm:space-y-2.5">
        {options.map((opt, idx) => {
          const letter = ['A','B','C','D','E','F'][idx] ?? ''
          let containerStyle = 'border-[#E2E5F0] hover:border-[#2D46B9]/40 hover:bg-[#EEF0F8] cursor-pointer'
          let badgeStyle = 'bg-[#F0F2F8] text-[#6B7280]'

          if (isQuestion && selectedOptionId === opt.id) {
            containerStyle = 'border-[#2D46B9] bg-[#EEF0F8] ring-1 ring-[#2D46B9]/20'
            badgeStyle = 'bg-[#2D46B9] text-white'
          }
          if (isFeedback) {
            const isCorrectOption = opt.id === currentQuestion?.correct_option_id
            const isSelected = opt.id === lastAnswer?.selectedOptionId
            if (isCorrectOption) { containerStyle = 'border-emerald-500 bg-emerald-50'; badgeStyle = 'bg-emerald-500 text-white' }
            else if (isSelected && !lastAnswer?.isCorrect) { containerStyle = 'border-red-400 bg-red-50'; badgeStyle = 'bg-red-400 text-white' }
            else { containerStyle = 'border-[#E2E5F0] opacity-40'; badgeStyle = 'bg-[#F0F2F8] text-[#9CA3AF]' }
          }

          return (
            <button key={opt.id} disabled={isFeedback || saving} onClick={() => isQuestion && setSelectedOptionId(opt.id)}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border-[1.5px] transition-all flex items-center gap-3 sm:gap-3.5 bg-white ${containerStyle}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[0.8125rem] font-bold shrink-0 transition-colors ${badgeStyle}`}>
                {isFeedback && opt.id === currentQuestion?.correct_option_id ? <CheckCircle className="w-[18px] h-[18px]" />
                  : isFeedback && opt.id === lastAnswer?.selectedOptionId && !lastAnswer?.isCorrect ? <XCircle className="w-[18px] h-[18px]" />
                  : letter}
              </div>
              <span className="text-[0.8125rem] sm:text-[0.9375rem] text-[#1A2340] leading-snug">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback toast — top-right */}
      {isFeedback && lastAnswer && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full rounded-xl p-4 shadow-lg border animate-in slide-in-from-right ${
          lastAnswer.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`} style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className="flex items-start gap-2.5">
            {lastAnswer.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            <div className="min-w-0">
              <p className="font-bold text-[0.8125rem] text-[#1A2340]">
                {lastAnswer.isCorrect ? 'Правильно!' : 'Неправильно'}
                {lastAnswer.xpEarned > 0 && <span className="ml-1.5 text-[#2D46B9]">+{lastAnswer.xpEarned} б.</span>}
              </p>
              {currentQuestion?.explanation && <p className="text-[0.75rem] text-[#6B7280] mt-1 leading-relaxed line-clamp-3">{currentQuestion.explanation}</p>}
              {currentQuestion?.playbook_ref && <p className="text-[0.6875rem] text-[#2D46B9] mt-1 font-semibold">{currentQuestion.playbook_ref}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      {isQuestion && (
        <Button onClick={() => submitAnswer(phase === 'second_try' ? 2 : 1)} disabled={!selectedOptionId || saving}
          className="w-full h-12 text-[0.9375rem] font-bold bg-[#2D46B9] hover:bg-[#233A9E] rounded-lg">
          {saving ? 'Сохранение...' : 'Ответить'}
        </Button>
      )}
      {isFeedback && (
        <Button onClick={handleNext} className="w-full h-12 text-[0.9375rem] font-bold bg-[#2D46B9] hover:bg-[#233A9E] rounded-lg gap-2">
          {phase === 'feedback' && lastAnswer && !lastAnswer.isCorrect ? 'Вторая попытка'
            : currentIndex < questions.length - 1 ? <>Следующий вопрос <ArrowRight className="w-4 h-4" /></> : 'Завершить тест'}
        </Button>
      )}
    </div>
  )
}
