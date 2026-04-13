export type UserRole = "client" | "contractor" | "admin";
export type ServiceCategory = "pool" | "landscaping" | "maid";
export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "cancelled";
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
  scheduled_date: string;
  scheduled_time: string | null;
  duration_hours: number | null;
  address: string;
  location: unknown;
  notes: string | null;
  quoted_price: number | null;
  final_price: number | null;
  status_updated_at: string;
  created_at: string;
  updated_at: string;
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
