"use client";

import { createClient } from "@/lib/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type UnreadCounts = {
  messages: number;
  notifications: number;
};

const UnreadCountContext = createContext<UnreadCounts>({
  messages: 0,
  notifications: 0,
});

export function useUnreadCounts() {
  return useContext(UnreadCountContext);
}

export function UnreadCountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counts, setCounts] = useState<UnreadCounts>({
    messages: 0,
    notifications: 0,
  });

  const fetchCounts = useCallback(async () => {
    const supabase = createClient();
    const [msgResult, notifResult] = await Promise.all([
      supabase.rpc("get_unread_message_count"),
      supabase.rpc("get_unread_notification_count"),
    ]);
    setCounts({
      messages: msgResult.data ?? 0,
      notifications: notifResult.data ?? 0,
    });
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30_000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return (
    <UnreadCountContext.Provider value={counts}>
      {children}
    </UnreadCountContext.Provider>
  );
}
