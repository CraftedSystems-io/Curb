import { createClient } from "@/lib/supabase/server";
import type {
  BookingEvent,
  BookingScopeItem,
  BookingInvoice,
  BookingPhoto,
  DailyLog,
  BookingCheckin,
  BookingShareToken,
  WaiverTemplate,
  WaiverSignature,
} from "@/types";

export async function getBookingEvents(bookingId: string): Promise<BookingEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_events")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  return (data ?? []) as BookingEvent[];
}

export async function getScopeItems(bookingId: string): Promise<BookingScopeItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_scope_items")
    .select("*")
    .eq("booking_id", bookingId)
    .order("sort_order", { ascending: true });
  return (data ?? []) as BookingScopeItem[];
}

export async function getInvoices(bookingId: string): Promise<BookingInvoice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .order("sort_order", { ascending: true });
  return (data ?? []) as BookingInvoice[];
}

export async function getBookingPhotos(bookingId: string): Promise<BookingPhoto[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_photos")
    .select("*")
    .eq("booking_id", bookingId)
    .order("taken_at", { ascending: false });
  return (data ?? []) as BookingPhoto[];
}

export async function getDailyLogs(bookingId: string): Promise<DailyLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("booking_id", bookingId)
    .order("log_date", { ascending: false });
  return (data ?? []) as DailyLog[];
}

export async function getCheckins(bookingId: string): Promise<BookingCheckin[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_checkins")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  return (data ?? []) as BookingCheckin[];
}

export async function getActiveShareToken(bookingId: string): Promise<BookingShareToken | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_share_tokens")
    .select("*")
    .eq("booking_id", bookingId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data ?? null) as BookingShareToken | null;
}

export async function getWaiverTemplatesForContractor(
  contractorId: string
): Promise<WaiverTemplate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("waiver_templates")
    .select("*")
    .eq("contractor_id", contractorId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as WaiverTemplate[];
}

export async function getSignaturesForBooking(
  bookingId: string
): Promise<(WaiverSignature & { waiver_templates?: { title: string } })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("waiver_signatures")
    .select("*, waiver_templates (title)")
    .eq("booking_id", bookingId)
    .order("signed_at", { ascending: false });
  return (data ?? []) as (WaiverSignature & {
    waiver_templates?: { title: string };
  })[];
}

export async function getBookingByShareToken(token: string) {
  const supabase = await createClient();
  const { data: tokenRow } = await supabase
    .from("booking_share_tokens")
    .select("*")
    .eq("token", token)
    .is("revoked_at", null)
    .maybeSingle();
  if (!tokenRow) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null;

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (*),
      contractors ( *, profiles (full_name, avatar_url) ),
      profiles ( full_name )
    `
    )
    .eq("id", tokenRow.booking_id)
    .single();

  // increment view_count
  await supabase
    .from("booking_share_tokens")
    .update({
      view_count: (tokenRow.view_count ?? 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", tokenRow.id);

  return { tokenRow, booking };
}
