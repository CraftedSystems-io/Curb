"use client";

import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChatPanel } from "@/components/chat/chat-panel";

interface ChatButtonProps {
  bookingId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
}

export function ChatButton({
  bookingId,
  currentUserId,
  otherPartyName,
  otherPartyAvatar,
}: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // Animated entrance
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("booking_id", bookingId)
      .eq("is_read", false)
      .neq("sender_id", currentUserId);

    setUnreadCount(count ?? 0);
  }, [bookingId, currentUserId, supabase]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Subscribe to new messages for unread count
  useEffect(() => {
    const channel = supabase
      .channel(`unread:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            sender_id: string;
            is_read: boolean;
          };
          if (newMsg.sender_id !== currentUserId && !isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        () => {
          // Refetch on updates (e.g., marking as read)
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, currentUserId, isOpen, supabase, fetchUnreadCount]);

  // Clear unread count when panel opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl hover:scale-105 active:scale-95",
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        )}
      >
        <MessageCircle
          size={24}
          className={clsx(
            "transition-transform duration-200",
            isOpen && "rotate-12"
          )}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-md animate-[badge-pop_0.3s_ease-out]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Pulse ring when there are unread messages */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 animate-ping" />
        )}
      </button>

      {/* Chat panel */}
      <ChatPanel
        bookingId={bookingId}
        currentUserId={currentUserId}
        otherPartyName={otherPartyName}
        otherPartyAvatar={otherPartyAvatar}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
