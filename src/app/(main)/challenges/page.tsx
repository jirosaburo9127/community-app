'use client'

import { useEffect, useState } from 'react'
import { getChallenges } from '@/lib/supabase/challenges'
import { Challenge } from '@/lib/types'
import { Zap, Plus } from 'lucide-react'
import Link from 'next/link'

const DIFFICULTY_LABELS: Record<Challenge['difficulty'], { label: string; color: string }> = {
  beginner: { label: '初級', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  intermediate: { label: '中級', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  advanced: { label: '上級', color: 'bg-rose-50 text-rose-600 border-rose-200' },
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const data = await getChallenges()
      setChallenges(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-accent" />
            <h1 className="text-xl font-bold text-gray-900">チャレンジ</h1>
          </div>
          <p className="text-sm text-muted mt-0.5">
            ビジネスプラン、ピッチ、プロトタイプ開発に挑戦しよう
          </p>
        </div>
        <Link
          href="/challenges/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-primary px-4 py-2 text-sm font-medium text-white shadow-md shadow-accent/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} />
          作成
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-border bg-white p-5 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-5 w-12 rounded-full bg-gray-200" />
              </div>
              <div className="mt-3 h-4 w-full rounded bg-gray-100" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10">
            <Zap size={28} className="text-accent" />
          </div>
          <p className="font-medium text-gray-700">まだチャレンジがありません</p>
          <p className="text-sm text-muted mt-1.5 max-w-xs">
            最初のチャレンジを作成して、コミュニティメンバーを巻き込みましょう
          </p>
          <Link
            href="/challenges/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-primary px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/20"
          >
            <Plus size={16} />
            チャレンジを作成
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => {
            const diff = DIFFICULTY_LABELS[c.difficulty]
            return (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-white p-5 transition-all hover:shadow-md hover:shadow-gray-200/50 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-gray-900">{c.title}</h2>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${diff.color}`}>
                    {diff.label}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {c.description}
                </p>

                {c.category && (
                  <div className="mt-3">
                    <span className="inline-flex rounded-md bg-surface px-2 py-0.5 text-xs text-muted">
                      {c.category}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
