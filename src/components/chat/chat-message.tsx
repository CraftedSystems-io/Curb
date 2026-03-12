"use client";

import { clsx } from "clsx";
import { format, isToday, isYesterday } from "date-fns";

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName: string;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }

  return format(date, "MMM d, h:mm a");
}

export function ChatMessage({
  content,
  timestamp,
  isOwn,
  senderName,
}: ChatMessageProps) {
  return (
    <div
      className={clsx("flex w-full mb-3", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={clsx("relative max-w-[75%] group", isOwn ? "order-1" : "order-1")}
      >
        {/* Sender name for other party messages */}
        {!isOwn && (
          <p className="text-[11px] font-medium text-gray-500 mb-0.5 ml-3">
            {senderName}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={clsx(
            "relative px-4 py-2.5 rounded-2xl shadow-sm transition-shadow",
            isOwn
              ? "bg-emerald-600 text-white rounded-br-md"
              : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
          )}
        >
          {/* Bubble tail */}
          <div
            className={clsx(
              "absolute bottom-0 w-3 h-3",
              isOwn
                ? "right-[-5px] bg-emerald-600"
                : "left-[-5px] bg-white border-l border-b border-gray-100",
              isOwn
                ? "[clip-path:polygon(0_0,0%_100%,100%_100%)]"
                : "[clip-path:polygon(100%_0,0%_100%,100%_100%)]"
            )}
          />

          {/* Message text */}
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Timestamp */}
        <p
          className={clsx(
            "text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isOwn ? "text-right text-gray-400 mr-1" : "text-left text-gray-400 ml-3"
          )}
        >
          {formatMessageTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
