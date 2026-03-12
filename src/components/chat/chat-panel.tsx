"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { clsx } from "clsx";
import { X, Send, Loader2 } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { ChatMessage } from "@/components/chat/chat-message";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatPanelProps {
  bookingId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDateDivider(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "EEEE, MMMM d");
}

export function ChatPanel({
  bookingId,
  currentUserId,
  otherPartyName,
  otherPartyAvatar,
  isOpen,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Fetch existing messages
  useEffect(() => {
    if (!isOpen) return;

    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    }

    fetchMessages();
  }, [bookingId, isOpen, supabase]);

  // Mark unread messages as read
  useEffect(() => {
    if (!isOpen || messages.length === 0) return;

    const unreadIds = messages
      .filter((m) => m.sender_id !== currentUserId && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    async function markAsRead() {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);

      setMessages((prev) =>
        prev.map((m) =>
          unreadIds.includes(m.id) ? { ...m, is_read: true } : m
        )
      );
    }

    markAsRead();
  }, [messages, currentUserId, isOpen, supabase]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (in case we also inserted it locally)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Auto-mark as read if from the other party
          if (newMsg.sender_id !== currentUserId) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, currentUserId, isOpen, supabase]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(loading ? "instant" : "smooth");
    }
  }, [messages, loading, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  async function handleSend() {
    const trimmed = newMessage.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      content: trimmed,
      is_read: false,
    });

    if (error) {
      // Restore message on error
      setNewMessage(trimmed);
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date for dividers
  function shouldShowDateDivider(index: number): boolean {
    if (index === 0) return true;
    const current = new Date(messages[index].created_at);
    const previous = new Date(messages[index - 1].created_at);
    return !isSameDay(current, previous);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-gray-50 shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Avatar
            src={otherPartyAvatar}
            name={otherPartyName}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {otherPartyName}
            </h3>
            <p className="text-xs text-emerald-600 font-medium">Active now</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-emerald-500" />
                <p className="text-sm text-gray-400">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <Send size={24} className="text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  No messages yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Send a message to start the conversation
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={message.id}>
                  {/* Date divider */}
                  {shouldShowDateDivider(index) && (
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                        {formatDateDivider(message.created_at)}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                  )}

                  <ChatMessage
                    content={message.content}
                    timestamp={message.created_at}
                    isOwn={message.sender_id === currentUserId}
                    senderName={
                      message.sender_id === currentUserId
                        ? "You"
                        : otherPartyName
                    }
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className={clsx(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                newMessage.trim()
                  ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} className={newMessage.trim() ? "ml-0.5" : ""} />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-gray-300">
            Messages are end-to-end encrypted
          </p>
        </div>
      </div>
    </>
  );
}
