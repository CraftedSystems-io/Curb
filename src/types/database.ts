export type UserRole = "client" | "contractor" | "admin";
export type ServiceCategory = "pool" | "landscaping" | "maid";
export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "cancelled";
export type BookingStage =
  | "inquiry"
  | "quoted"
  | "accepted"
  | "deposit_paid"
  | "scheduled"
  | "on_site"
  | "punch_list"
  | "completed"
  | "cancelled"
  | "declined";
export type AppointmentType = "measure" | "delivery" | "install" | "service" | "punch";
export type ProTier = "new" | "bronze" | "silver" | "gold" | "platinum";
export type InvoiceKind = "deposit" | "progress" | "final" | "change_order";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
export type PhotoPhase = "before" | "during" | "after" | "issue";
export type BookingEventType =
  | "stage_change"
  | "message"
  | "photo"
  | "checkin"
  | "invoice"
  | "scope_change"
  | "note"
  | "signature";
export type SubscriptionPlan = "starter" | "professional" | "enterprise";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  profile_id: string;
  business_name: string | null;
  bio: string | null;
  years_experience: number;
  hourly_rate: number | null;
  rating_avg: number;
  review_count: number;
  is_active: boolean;
  is_verified: boolean;
  base_location: unknown;
  service_radius_m: number;
  service_area: unknown;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  tier: ProTier;
  tier_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  icon_name: string | null;
}

export interface ContractorService {
  id: string;
  contractor_id: string;
  service_id: string;
  price: number | null;
  price_unit: string;
}

export interface Booking {
  id: string;
  client_id: string;
  contractor_id: string;
  service_id: string;
  status: BookingStatus;
  stage: BookingStage | null;
  job_number: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  duration_hours: number | null;
  address: string;
  location: unknown;
  notes: string | null;
  quoted_price: number | null;
  final_price: number | null;
  recurrence_rule: string | null;
  parent_booking_id: string | null;
  appointment_type: AppointmentType | null;
  status_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  actor_id: string | null;
  actor_role: string | null;
  event_type: BookingEventType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BookingScopeItem {
  id: string;
  booking_id: string;
  title: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  sort_order: number;
  is_optional: boolean;
  is_change_order: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingInvoice {
  id: string;
  booking_id: string;
  kind: InvoiceKind;
  status: InvoiceStatus;
  amount: number;
  notes: string | null;
  sort_order: number;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPhoto {
  id: string;
  booking_id: string;
  uploader_id: string | null;
  url: string;
  caption: string | null;
  phase: PhotoPhase;
  sort_order: number;
  location: unknown;
  taken_at: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  booking_id: string;
  contractor_id: string;
  log_date: string;
  hours_worked: number | null;
  crew_count: number | null;
  weather: string | null;
  percent_complete: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingShareToken {
  id: string;
  booking_id: string;
  token: string;
  created_by: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  created_at: string;
}

export interface BookingCheckin {
  id: string;
  booking_id: string;
  contractor_id: string;
  kind: "arrival" | "departure" | "break";
  location: unknown;
  accuracy_m: number | null;
  distance_from_job_m: number | null;
  is_within_geofence: boolean | null;
  note: string | null;
  created_at: string;
}

export interface WaiverTemplate {
  id: string;
  contractor_id: string;
  title: string;
  body: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaiverSignature {
  id: string;
  template_id: string;
  signer_id: string | null;
  booking_id: string | null;
  signer_name: string;
  signer_email: string | null;
  signature_svg: string;
  ip_address: string | null;
  user_agent: string | null;
  template_snapshot: string;
  signed_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  contractor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Availability {
  id: string;
  contractor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export type NotificationType =
  | "booking_update"
  | "new_message"
  | "new_review"
  | "new_booking";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// Result from find_nearby_contractors RPC
export interface NearbyContractor {
  id: string;
  profile_id: string;
  business_name: string | null;
  bio: string | null;
  hourly_rate: number | null;
  rating_avg: number;
  review_count: number;
  base_lat: number;
  base_lng: number;
  distance_m: number;
  full_name: string;
  avatar_url: string | null;
  tier: ProTier | null;
  services: {
    id: string;
    name: string;
    category: ServiceCategory;
    price: number | null;
    price_unit: string;
  }[];
}

export interface PortfolioPhoto {
  id: string;
  contractor_id: string;
  url: string;
  caption: string | null;
  category: ServiceCategory | null;
  sort_order: number;
  created_at: string;
}

// Extended types for joined queries
export interface ContractorWithProfile extends Contractor {
  profiles: Profile;
}

export interface BookingWithDetails extends Booking {
  profiles: Profile; // client profile
  contractors: Contractor & { profiles: Profile };
  services: Service;
}

export interface ReviewWithClient extends Review {
  profiles: Profile;
}
