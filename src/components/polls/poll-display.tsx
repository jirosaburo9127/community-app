"use client";

import { createClient } from "@/lib/supabase/client";
import type { Poll, PollOption } from "@/lib/types";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PollDisplay({
  poll,
  votedOptionId,
}: {
  poll: Poll;
  votedOptionId: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState(!!votedOptionId);
  const [currentVotedId, setCurrentVotedId] = useState(votedOptionId);
  const [pending, setPending] = useState(false);
  const [options, setOptions] = useState(poll.poll_options ?? []);

  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  async function handleVote() {
    if (!selectedId || pending) return;
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("poll_votes")
        .insert({ poll_option_id: selectedId, user_id: (await supabase.auth.getUser()).data.user!.id });

      if (!error) {
        setVoted(true);
        setCurrentVotedId(selectedId);
        setOptions((prev) =>
          prev.map((o) =>
            o.id === selectedId ? { ...o, vote_count: o.vote_count + 1 } : o
          )
        );
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <BarChart3 size={15} className="text-accent" />
        {poll.question}
      </div>

      {!voted ? (
        <div className="space-y-2">
          {options
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedId(option.id)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-all ${
                  selectedId === option.id
                    ? "border-accent bg-accent/8 text-accent font-medium"
                    : "border-border bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    selectedId === option.id
                      ? "border-accent bg-accent"
                      : "border-gray-300"
                  }`}
                >
                  {selectedId === option.id && (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                {option.label}
              </button>
            ))}
          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedId || pending}
            className="mt-1 w-full rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {pending ? "投票中..." : "投票する"}
          </button>
          <p className="text-center text-xs text-muted">
            {totalVotes}票
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {options
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((option) => {
              const newTotal = totalVotes + (voted && !votedOptionId ? 1 : 0);
              const pct = newTotal > 0 ? Math.round((option.vote_count / newTotal) * 100) : 0;
              const isMyVote = option.id === currentVotedId;
              return (
                <div key={option.id} className="relative">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm">
                    <div className="z-10 flex items-center gap-1.5">
                      {isMyVote && (
                        <CheckCircle2 size={14} className="text-accent" />
                      )}
                      <span className={isMyVote ? "font-medium text-accent" : "text-gray-700"}>
                        {option.label}
                      </span>
                    </div>
                    <span className="z-10 text-xs font-medium text-gray-500">
                      {pct}%
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 rounded-lg bg-accent/8"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              );
            })}
          <p className="text-center text-xs text-muted">
            {totalVotes + (voted && !votedOptionId ? 1 : 0)}票
          </p>
        </div>
      )}
    </div>
  );
}
