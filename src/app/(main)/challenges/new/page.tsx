'use client'

import { useState } from 'react'
import { createChallenge } from '@/lib/supabase/challenges'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewChallengePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      await createChallenge({ title, description })
      router.push('/challenges')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/challenges"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">チャレンジ作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-5 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例：MVP開発チャレンジ"
            required
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="チャレンジの内容や参加条件を書きましょう"
            rows={5}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-accent to-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
        >
          {submitting ? '作成中...' : 'チャレンジを作成'}
        </button>
      </form>
    </div>
  )
}
