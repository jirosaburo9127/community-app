"use client";

import { BarChart3, Plus, X } from "lucide-react";
import { useState } from "react";

export function PollFormSection({
  onPollChange,
}: {
  onPollChange: (poll: { question: string; options: string[] } | null) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  function toggle() {
    if (enabled) {
      setEnabled(false);
      onPollChange(null);
    } else {
      setEnabled(true);
    }
  }

  function updateOption(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    setOptions(next);
    if (question.trim() && next.every((o) => o.trim())) {
      onPollChange({ question, options: next });
    }
  }

  function addOption() {
    if (options.length >= 4) return;
    setOptions([...options, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== index);
    setOptions(next);
    if (question.trim() && next.every((o) => o.trim())) {
      onPollChange({ question, options: next });
    }
  }

  function handleQuestionChange(value: string) {
    setQuestion(value);
    if (value.trim() && options.every((o) => o.trim())) {
      onPollChange({ question: value, options });
    }
  }

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        <BarChart3 size={15} />
        アンケートを追加
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
          <BarChart3 size={15} />
          アンケート
        </div>
        <button
          type="button"
          onClick={toggle}
          className="text-muted hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      <input
        type="text"
        value={question}
        onChange={(e) => handleQuestionChange(e.target.value)}
        placeholder="質問を入力..."
        maxLength={200}
        className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted w-4 text-center">
              {i + 1}
            </span>
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`選択肢 ${i + 1}`}
              maxLength={100}
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-muted hover:text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 4 && (
        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <Plus size={13} />
          選択肢を追加
        </button>
      )}
    </div>
  );
}
