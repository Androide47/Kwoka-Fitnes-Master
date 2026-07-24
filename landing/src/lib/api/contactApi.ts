import { readJson, writeJson } from "@/lib/api/storage";

const CONTACT_KEY = "kwoka_contact_submissions";
const NEWSLETTER_KEY = "kwoka_newsletter_subscriptions";

export type ContactSubmission = {
  id: string;
  type: "contact";
  name?: string;
  email: string;
  message: string;
  createdAt: string;
};

export type IssueSubmission = {
  id: string;
  type: "issue";
  email: string;
  category: string;
  details: string;
  createdAt: string;
};

export type NewsletterSubscription = {
  id: string;
  email: string;
  createdAt: string;
};

type SupportSubmission = ContactSubmission | IssueSubmission;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function requireEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    throw new Error("A valid email is required.");
  }
  return normalized;
}

function readSupportSubmissions(): SupportSubmission[] {
  return readJson<SupportSubmission[]>(CONTACT_KEY, []);
}

function writeSupportSubmissions(submissions: SupportSubmission[]) {
  writeJson(CONTACT_KEY, submissions);
}

export function submitContact(input: { name?: string; email: string; message: string }): ContactSubmission {
  const message = input.message.trim();
  if (!message) {
    throw new Error("Message is required.");
  }
  const submission: ContactSubmission = {
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "contact",
    name: input.name?.trim() || undefined,
    email: requireEmail(input.email),
    message,
    createdAt: new Date().toISOString(),
  };
  writeSupportSubmissions([submission, ...readSupportSubmissions()]);
  return submission;
}

export function submitIssue(input: { email: string; category: string; details: string }): IssueSubmission {
  const category = input.category.trim();
  const details = input.details.trim();
  if (!category || !details) {
    throw new Error("Category and details are required.");
  }
  const submission: IssueSubmission = {
    id: `issue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "issue",
    email: requireEmail(input.email),
    category,
    details,
    createdAt: new Date().toISOString(),
  };
  writeSupportSubmissions([submission, ...readSupportSubmissions()]);
  return submission;
}

export function listSupportSubmissions(): SupportSubmission[] {
  return readSupportSubmissions();
}

export function subscribeNewsletter(email: string): NewsletterSubscription {
  const normalized = requireEmail(email);
  const existing = readJson<NewsletterSubscription[]>(NEWSLETTER_KEY, []);
  const current = existing.find((subscription) => subscription.email === normalized);
  if (current) return current;
  const subscription: NewsletterSubscription = {
    id: `newsletter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: normalized,
    createdAt: new Date().toISOString(),
  };
  writeJson(NEWSLETTER_KEY, [subscription, ...existing]);
  return subscription;
}

export function listNewsletterSubscriptions(): NewsletterSubscription[] {
  return readJson<NewsletterSubscription[]>(NEWSLETTER_KEY, []);
}

export const contactApi = {
  submitContact,
  submitIssue,
  listSupportSubmissions,
  subscribeNewsletter,
  listNewsletterSubscriptions,
};

export const newsletterApi = {
  subscribe: subscribeNewsletter,
  listSubscriptions: listNewsletterSubscriptions,
};
