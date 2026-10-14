import { nowIso, uid } from "./cn";
import { config } from "./config";
import { loadDb, resetDb, saveDb } from "./db";
import { DEMO_ADMIN } from "./seed";
import type {
  AdminDb,
  AppointmentStatus,
  BlogPost,
  Broadcast,
  CreditEntry,
  Exercise,
  FeatureFlags,
  MediaFile,
  NewsletterSub,
  OrderStatus,
  PlatformSettings,
  Product,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
  UserRole,
  Workout,
} from "./types";

const wait = (ms = 180) => new Promise((r) => setTimeout(r, ms));

async function mutate<T>(fn: (db: AdminDb) => T): Promise<T> {
  await wait();
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}

export type Session = { token: string; user: User };

export const adminApi = {
  async login(email: string, password: string): Promise<Session> {
    await wait(280);
    if (config.useMocks) {
      if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        const db = loadDb();
        const user = db.users.find((u) => u.email === DEMO_ADMIN.email);
        if (!user) throw new Error("ADMIN_NOT_FOUND");
        return { token: "mock-admin-jwt", user };
      }
      throw new Error("INVALID_CREDENTIALS");
    }
    const res = await fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, roleHint: "admin" }),
    });
    if (!res.ok) throw new Error("INVALID_CREDENTIALS");
    return res.json();
  },

  resetDemo: async () => {
    await wait(120);
    return resetDb();
  },

  dashboard: () =>
    mutate((db) => ({
      openTickets: db.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
      activeUsers: db.users.filter((u) => u.isActive).length,
      paidRevenue: db.orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.totalCents, 0),
      pendingBookings: db.appointments.filter((a) => a.status === "pending").length,
      orders: db.orders.length,
      newsletter: db.newsletter.filter((n) => n.isActive).length,
      flaggedMessages: db.messages.filter((m) => m.flagged).length,
      aws: db.aws,
      revenueByDay: [
        { day: "Mon", revenue: 34 },
        { day: "Tue", revenue: 99 },
        { day: "Wed", revenue: 19 },
        { day: "Thu", revenue: 0 },
        { day: "Fri", revenue: 149 },
        { day: "Sat", revenue: 39 },
        { day: "Sun", revenue: 0 },
      ],
      recentTickets: [...db.tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    })),

  users: {
    list: () => mutate((db) => db.users),
    save: (input: Partial<User> & { email: string; name: string; role: UserRole }) =>
      mutate((db) => {
        if (input.id) {
          db.users = db.users.map((u) => (u.id === input.id ? { ...u, ...input } : u));
          return db.users.find((u) => u.id === input.id)!;
        }
        const user: User = {
          id: uid("user"),
          isActive: true,
          emailVerified: false,
          joinedAt: nowIso(),
          ...input,
        };
        db.users.unshift(user);
        return user;
      }),
    setActive: (id: string, isActive: boolean) =>
      mutate((db) => {
        db.users = db.users.map((u) => (u.id === id ? { ...u, isActive } : u));
      }),
  },

  tickets: {
    list: () => mutate((db) => db.tickets),
    update: (id: string, patch: Partial<Pick<Ticket, "status" | "priority" | "assigneeId">>) =>
      mutate((db) => {
        db.tickets = db.tickets.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t));
      }),
    reply: (id: string, author: string, body: string, internal: boolean) =>
      mutate((db) => {
        db.tickets = db.tickets.map((t) =>
          t.id === id
            ? {
                ...t,
                updatedAt: nowIso(),
                status: internal ? t.status : ("waiting" as TicketStatus),
                replies: [...t.replies, { id: uid("r"), author, body, createdAt: nowIso(), internal }],
              }
            : t,
        );
      }),
    create: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "replies">) =>
      mutate((db) => {
        const created: Ticket = { ...ticket, id: uid("tkt"), createdAt: nowIso(), updatedAt: nowIso(), replies: [] };
        db.tickets.unshift(created);
        return created;
      }),
    setPriority: (id: string, priority: TicketPriority) =>
      mutate((db) => {
        db.tickets = db.tickets.map((t) => (t.id === id ? { ...t, priority, updatedAt: nowIso() } : t));
      }),
  },

  products: {
    list: () => mutate((db) => db.products),
    save: (input: Product) =>
      mutate((db) => {
        if (db.products.some((p) => p.id === input.id)) {
          db.products = db.products.map((p) => (p.id === input.id ? input : p));
          return input;
        }
        const product = { ...input, id: input.id || uid("prod") };
        db.products.unshift(product);
        return product;
      }),
    remove: (id: string) =>
      mutate((db) => {
        db.products = db.products.filter((p) => p.id !== id);
      }),
  },

  orders: {
    list: () => mutate((db) => db.orders),
    setStatus: (id: string, status: OrderStatus) =>
      mutate((db) => {
        db.orders = db.orders.map((o) =>
          o.id === id ? { ...o, status, paidAt: status === "paid" ? o.paidAt ?? nowIso() : o.paidAt } : o,
        );
      }),
  },

  appointments: {
    list: () => mutate((db) => db.appointments),
    setStatus: (id: string, status: AppointmentStatus) =>
      mutate((db) => {
        db.appointments = db.appointments.map((a) => (a.id === id ? { ...a, status } : a));
      }),
  },

  workouts: {
    list: () => mutate((db) => db.workouts),
    save: (input: Workout) =>
      mutate((db) => {
        if (db.workouts.some((w) => w.id === input.id)) {
          db.workouts = db.workouts.map((w) => (w.id === input.id ? input : w));
          return input;
        }
        const workout = { ...input, id: input.id || uid("wo") };
        db.workouts.unshift(workout);
        return workout;
      }),
    remove: (id: string) =>
      mutate((db) => {
        db.workouts = db.workouts.filter((w) => w.id !== id);
      }),
  },

  exercises: {
    list: () => mutate((db) => db.exercises),
    save: (input: Exercise) =>
      mutate((db) => {
        if (db.exercises.some((e) => e.id === input.id)) {
          db.exercises = db.exercises.map((e) => (e.id === input.id ? input : e));
          return input;
        }
        const ex = { ...input, id: input.id || uid("ex") };
        db.exercises.unshift(ex);
        return ex;
      }),
    remove: (id: string) =>
      mutate((db) => {
        db.exercises = db.exercises.filter((e) => e.id !== id);
      }),
  },

  blog: {
    list: () => mutate((db) => db.blogPosts),
    save: (input: BlogPost) =>
      mutate((db) => {
        if (db.blogPosts.some((p) => p.id === input.id)) {
          db.blogPosts = db.blogPosts.map((p) => (p.id === input.id ? input : p));
          return input;
        }
        const post = { ...input, id: input.id || uid("blog"), createdAt: input.createdAt || nowIso() };
        db.blogPosts.unshift(post);
        return post;
      }),
    remove: (id: string) =>
      mutate((db) => {
        db.blogPosts = db.blogPosts.filter((p) => p.id !== id);
      }),
  },

  newsletter: {
    list: () => mutate((db) => db.newsletter),
    setActive: (id: string, isActive: boolean) =>
      mutate((db) => {
        db.newsletter = db.newsletter.map((n) => (n.id === id ? { ...n, isActive } : n));
      }),
    add: (email: string) =>
      mutate((db) => {
        const sub: NewsletterSub = { id: uid("nl"), email, isActive: true, createdAt: nowIso() };
        db.newsletter.unshift(sub);
        return sub;
      }),
  },

  messages: {
    list: () => mutate((db) => db.messages),
    setFlagged: (id: string, flagged: boolean) =>
      mutate((db) => {
        db.messages = db.messages.map((m) => (m.id === id ? { ...m, flagged } : m));
      }),
    remove: (id: string) =>
      mutate((db) => {
        db.messages = db.messages.filter((m) => m.id !== id);
      }),
  },

  credits: {
    list: () => mutate((db) => db.credits),
    adjust: (userId: string, delta: number, note: string) =>
      mutate((db) => {
        const entry: CreditEntry = {
          id: uid("cr"),
          userId,
          delta,
          reason: "admin_adjust",
          note,
          periodMonth: nowIso().slice(0, 7),
          createdAt: nowIso(),
        };
        db.credits.unshift(entry);
        return entry;
      }),
  },

  media: {
    list: () => mutate((db) => db.media),
    setStatus: (id: string, status: MediaFile["status"]) =>
      mutate((db) => {
        db.media = db.media.map((m) => (m.id === id ? { ...m, status } : m));
      }),
  },

  content: {
    testimonials: () => mutate((db) => db.testimonials),
    saveTestimonial: (item: AdminDb["testimonials"][number]) =>
      mutate((db) => {
        if (db.testimonials.some((t) => t.id === item.id)) {
          db.testimonials = db.testimonials.map((t) => (t.id === item.id ? item : t));
          return item;
        }
        const created = { ...item, id: item.id || uid("tes") };
        db.testimonials.unshift(created);
        return created;
      }),
    removeTestimonial: (id: string) =>
      mutate((db) => {
        db.testimonials = db.testimonials.filter((t) => t.id !== id);
      }),
    flags: () => mutate((db) => db.flags),
    saveFlags: (flags: FeatureFlags) =>
      mutate((db) => {
        db.flags = flags;
        return flags;
      }),
    settings: () => mutate((db) => db.settings),
    saveSettings: (settings: PlatformSettings) =>
      mutate((db) => {
        db.settings = settings;
        return settings;
      }),
    broadcasts: () => mutate((db) => db.broadcasts),
    sendBroadcast: (input: Omit<Broadcast, "id" | "createdAt">) =>
      mutate((db) => {
        const bc: Broadcast = { ...input, id: uid("bc"), createdAt: nowIso() };
        db.broadcasts.unshift(bc);
        return bc;
      }),
  },
};

export function userName(users: User[], id?: string) {
  return users.find((u) => u.id === id)?.name ?? "—";
}

export { DEMO_ADMIN };
