"use client";

import { ChatButton } from "@/components/chat/chat-button";

interface ChatWrapperProps {
  bookingId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
}

export function ChatWrapper({
  bookingId,
  currentUserId,
  otherPartyName,
  otherPartyAvatar,
}: ChatWrapperProps) {
  return (
    <ChatButton
      bookingId={bookingId}
      currentUserId={currentUserId}
      otherPartyName={otherPartyName}
      otherPartyAvatar={otherPartyAvatar}
    />
  );
}
