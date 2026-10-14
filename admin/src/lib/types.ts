export type Locale = "en" | "es";
export type UserRole = "client" | "trainer" | "admin";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type ProductType = "physical" | "digital" | "session_package" | "subscription";
export type OrderStatus = "draft" | "pending_payment" | "paid" | "cancelled" | "refunded";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketSource = "landing" | "mobile" | "admin";
export type TicketCategory = "app" | "order" | "account" | "billing" | "training" | "other";
export type CreditReason = "order_grant" | "booking_spend" | "booking_refund" | "admin_adjust" | "expiry";
export type MediaPurpose =
  | "avatar"
  | "progress-photo"
  | "message-attachment"
  | "exercise-media"
  | "blog-cover"
  | "other";
export type AwsServiceStatus = "active" | "inactive" | "degraded";
export type Surface = "landing" | "mobile";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  joinedAt: string;
  trainerId?: string;
  fitnessLevel?: FitnessLevel;
  goals?: string[];
  streakCount?: number;
  bio?: string;
  specialties?: string[];
  lastSeenAt?: string;
};

export type TicketReply = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  internal: boolean;
};

export type Ticket = {
  id: string;
  email: string;
  name: string;
  subject: string;
  category: TicketCategory;
  source: TicketSource;
  status: TicketStatus;
  priority: TicketPriority;
  details: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ProductType;
  priceCents: number;
  sessionCredits?: number;
  isActive: boolean;
  surfaces: Surface[];
};

export type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  unitPriceCents: number;
};

export type Order = {
  id: string;
  userId?: string;
  email: string;
  customerName: string;
  status: OrderStatus;
  totalCents: number;
  items: OrderItem[];
  createdAt: string;
  paidAt?: string;
};

export type Appointment = {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  location?: string;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  equipment: string[];
  difficulty: FitnessLevel;
  isLibrary: boolean;
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  clientId?: string;
  durationMin: number;
  difficulty: FitnessLevel;
  scheduledFor?: string;
  isTemplate: boolean;
  exerciseIds: string[];
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  authorId: string;
  category: string;
  publishedAt?: string;
  createdAt: string;
};

export type NewsletterSub = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  flagged: boolean;
};

export type CreditEntry = {
  id: string;
  userId: string;
  delta: number;
  reason: CreditReason;
  note: string;
  periodMonth: string;
  createdAt: string;
};

export type MediaFile = {
  id: string;
  ownerUserId: string;
  purpose: MediaPurpose;
  originalName: string;
  s3Key: string;
  contentType: string;
  byteSize: number;
  status: "pending" | "ready" | "failed" | "deleted";
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  coach: string;
  quote: string;
  result: string;
  goal: string;
  initials: string;
  isActive: boolean;
};

export type Broadcast = {
  id: string;
  title: string;
  message: string;
  audience: "all" | "clients" | "trainers" | "landing" | "mobile";
  createdAt: string;
};

export type FeatureFlags = {
  storeEnabled: boolean;
  blogEnabled: boolean;
  bookingsEnabled: boolean;
  messagingEnabled: boolean;
  progressPhotosEnabled: boolean;
  socialLoginEnabled: boolean;
  newsletterEnabled: boolean;
  contactFormEnabled: boolean;
  landingMaintenance: boolean;
  mobileMaintenance: boolean;
  forceMobileUpdate: boolean;
};

export type LocalizedText = { en: string; es: string };

export type PlatformSettings = {
  supportEmail: string;
  helpUrl: string;
  iosAppUrl: string;
  androidAppUrl: string;
  minIosVersion: string;
  minAndroidVersion: string;
  defaultLocale: Locale;
  sessionLengthMin: number;
  hero: { eyebrow: LocalizedText; title: LocalizedText; subtitle: LocalizedText };
  about: LocalizedText;
};

export type AwsHealth = {
  apiGateway: AwsServiceStatus;
  cognito: AwsServiceStatus;
  rds: AwsServiceStatus;
  s3: AwsServiceStatus;
  ses: AwsServiceStatus;
  lastCheckedAt: string;
  usingMocks: boolean;
};

export type AdminDb = {
  users: User[];
  tickets: Ticket[];
  products: Product[];
  orders: Order[];
  appointments: Appointment[];
  exercises: Exercise[];
  workouts: Workout[];
  blogPosts: BlogPost[];
  newsletter: NewsletterSub[];
  messages: Message[];
  credits: CreditEntry[];
  media: MediaFile[];
  testimonials: Testimonial[];
  broadcasts: Broadcast[];
  flags: FeatureFlags;
  settings: PlatformSettings;
  aws: AwsHealth;
};
