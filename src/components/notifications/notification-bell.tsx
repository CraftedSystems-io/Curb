"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { NotificationItem } from "./notification-item";
import type { Notification, NotificationType } from "@/types";

const NOTIFICATIONS_LIMIT = 20;

export function NotificationBell() {
  const { user } = useUser();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Fetch initial notifications ──────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(NOTIFICATIONS_LIMIT);

      if (data) {
        setNotifications(data as Notification[]);
      }
    }

    fetchNotifications();
  }, [user]);

  // ── Realtime subscription ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const incoming = payload.new as Notification;
          setNotifications((prev) => [incoming, ...prev].slice(0, NOTIFICATIONS_LIMIT));
          triggerShake();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ── Close on outside click ───────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // ── Bell shake animation ─────────────────────────────────────────
  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 820);
  }

  // ── Mark one notification read ───────────────────────────────────
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (!notification.is_read) {
        const supabase = createClient();
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notification.id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      setOpen(false);

      if (notification.link) {
        router.push(notification.link);
      }
    },
    [router]
  );

  // ── Mark all read ────────────────────────────────────────────────
  async function handleMarkAllRead() {
    if (!user || unreadCount === 0) return;

    const supabase = createClient();
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          "relative rounded-lg p-2 text-gray-500 transition-colors",
          "hover:bg-gray-100 hover:text-gray-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          shake && "animate-notification-shake"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={clsx(
              "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center",
              "rounded-full bg-red-500 px-1 text-[11px] font-bold text-white",
              "ring-2 ring-white",
              "animate-notification-pulse"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className={clsx(
            "absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl",
            "border border-gray-200 bg-white shadow-xl shadow-gray-200/60",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className={clsx(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                  "text-emerald-600 transition-colors hover:bg-emerald-50"
                )}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  We&apos;ll let you know when something comes up
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type as NotificationType}
                  title={notification.title}
                  body={notification.body}
                  isRead={notification.is_read}
                  createdAt={notification.created_at}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications");
                }}
                className={clsx(
                  "flex w-full items-center justify-center py-2.5 text-xs font-medium",
                  "text-emerald-600 transition-colors hover:bg-emerald-50/50"
                )}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes notification-shake {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(12deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-6deg); }
          75% { transform: rotate(3deg); }
          85% { transform: rotate(-2deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes notification-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .animate-notification-shake {
          animation: notification-shake 0.8s ease-in-out;
        }

        .animate-notification-pulse {
          animation: notification-pulse 2s ease-in-out infinite;
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .slide-in-from-top-2 {
          animation: slideInFromTop 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInFromTop {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
