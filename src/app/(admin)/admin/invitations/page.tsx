"use client";

import { createClient } from "@/lib/supabase/client";
import type { Invitation } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { Copy, Check, Trash2, Plus, Loader2 } from "lucide-react";

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchInvitations = async () => {
    const { data, error: fetchError } = await supabase
      .from("invitations")
      .select("*, profiles:created_by(id, display_name), used_profile:used_by(id, display_name)")
      .order("created_at", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setInvitations((data as Invitation[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const values = crypto.getRandomValues(new Uint32Array(12));
    let code = "";
    for (let i = 0; i < 12; i++) {
      code += chars[values[i] % chars.length];
    }
    return code;
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("認証情報を取得できませんでした");
      setCreating(false);
      return;
    }
    const code = generateCode();
    const { error: insertError } = await supabase.from("invitations").insert({
      code,
      created_by: user?.id,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      await fetchInvitations();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("invitations").delete().eq("id", id);
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleCopy = async (code: string, id: string) => {
    const url = `${window.location.origin}/register?code=${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  const unused = invitations.filter((inv) => !inv.used_by);
  const used = invitations.filter((inv) => inv.used_by);

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">招待管理</h2>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          招待コードを発行
        </button>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-10 text-center">
          <p className="text-sm text-muted">招待コードがまだありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unused.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">未使用（{unused.length}件）</h3>
              <div className="rounded-xl border border-border bg-white divide-y divide-border">
                {unused.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                      <code className="rounded bg-gray-50 px-2.5 py-1 text-sm font-mono font-medium text-gray-900">
                        {inv.code}
                      </code>
                      <span className="text-xs text-muted">
                        {new Date(inv.created_at).toLocaleDateString("ja-JP")}
                      </span>
                      {inv.expires_at && (
                        <span className="text-xs text-orange-600">
                          期限: {new Date(inv.expires_at).toLocaleDateString("ja-JP")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(inv.code, inv.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="招待URLをコピー"
                      >
                        {copiedId === inv.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {used.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">使用済み（{used.length}件）</h3>
              <div className="rounded-xl border border-border bg-white divide-y divide-border">
                {used.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 opacity-60">
                    <div className="flex items-center gap-4">
                      <code className="rounded bg-gray-50 px-2.5 py-1 text-sm font-mono text-gray-500 line-through">
                        {inv.code}
                      </code>
                      <span className="text-xs text-muted">
                        使用者: {(inv.used_profile as any)?.display_name ?? "不明"}
                      </span>
                      {inv.used_at && (
                        <span className="text-xs text-muted">
                          {new Date(inv.used_at).toLocaleDateString("ja-JP")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
