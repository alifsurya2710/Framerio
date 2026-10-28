'use client'
import { useState, useEffect } from 'react'

interface MathCaptchaProps {
  onValidate: (isValid: boolean) => void
}

export default function MathCaptcha({ onValidate }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    setNum1(a)
    setNum2(b)
    setUserAnswer('')
    setIsAnswerCorrect(null)
    onValidate(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setUserAnswer(val)
    const answer = parseInt(val, 10)
    if (!isNaN(answer) && answer === num1 + num2) {
      setIsAnswerCorrect(true)
      onValidate(true)
    } else {
      setIsAnswerCorrect(false)
      onValidate(false)
    }
  }

  return (
    <div className="bg-white/80 border border-zinc-300 rounded-2xl p-3.5 shadow-sm space-y-2 w-full">
      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
        <span>Verifikasi Keamanan</span>
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-[#e85200] hover:underline font-bold text-[10px]"
        >
          Acak Soal
        </button>
      </div>

      {/* Horizontal Compact Layout - Tidak Vertikal di Mobile */}
      <div className="flex items-center gap-2.5 w-full">
        <div className="flex-shrink-0 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-xl font-mono font-bold text-sm select-none tracking-wider whitespace-nowrap">
          {num1} + {num2} =
        </div>
        <input
          type="number"
          required
          placeholder="Jawaban"
          value={userAnswer}
          onChange={handleChange}
          className={`flex-1 min-w-0 bg-white border rounded-xl px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none text-sm transition font-medium ${
            isAnswerCorrect === true
              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
              : isAnswerCorrect === false && userAnswer !== ''
              ? 'border-rose-500 ring-2 ring-rose-500/30'
              : 'border-zinc-300 focus:ring-2 focus:ring-[#e85200]/30'
          }`}
        />
      </div>

      {isAnswerCorrect === true && (
        <p className="text-[11px] text-emerald-600 font-bold">Verifikasi sukses.</p>
      )}
      {isAnswerCorrect === false && userAnswer !== '' && (
        <p className="text-[11px] text-rose-600 font-bold">Jawaban belum tepat.</p>
      )}
    </div>
  )
}
