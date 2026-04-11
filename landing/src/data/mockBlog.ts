export type BlogComment = { id: string; author: string; body: string; at: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  body: string;
  comments: BlogComment[];
};

export const mockPosts: BlogPost[] = [
  {
    slug: "zone-2-for-busy-athletes",
    title: "Zone 2 for busy athletes",
    excerpt: "How to stack easy cardio without killing your schedule.",
    date: "2026-03-12",
    readTime: "6 min",
    body: `Low-intensity work builds your aerobic base and helps recovery between hard sessions. Start with two 30-minute sessions weekly, keeping heart rate conversational.

Track perceived effort: you should be able to speak in full sentences. If you only have twenty minutes, consistency beats intensity—show up, stay easy, repeat.`,
    comments: [
      { id: "1", author: "Maya R.", body: "This finally clicked for me—thanks!", at: "2026-03-14" },
      { id: "2", author: "Chris", body: "Any tips for treadmill vs bike?", at: "2026-03-15" },
    ],
  },
  {
    slug: "squat-depth-without-pain",
    title: "Squat depth without pain",
    excerpt: "Ankle and hip prep drills that actually stick.",
    date: "2026-02-28",
    readTime: "8 min",
    body: `Depth is a skill, not a personality trait. Before loading the bar, own your ankle dorsiflexion and hip flexion with split squats and paused goblet squats.

Film from the side once a month—small wins compound. If knees or back complain, reduce load and widen stance slightly before chasing PRs.`,
    comments: [{ id: "1", author: "Jordan", body: "Paused goblets are underrated.", at: "2026-03-01" }],
  },
  {
    slug: "sleep-as-performance",
    title: "Sleep as performance",
    excerpt: "The cheapest recovery tool you already own.",
    date: "2026-02-10",
    readTime: "5 min",
    body: `Seven to nine hours is the boring answer because it works. Cool, dark room; consistent wake time; caffeine cut-off eight hours before bed.

Short naps (20 minutes) can rescue a bad night without stealing night sleep.`,
    comments: [],
  },
];

export function getPostBySlug(slug: string | undefined) {
  return mockPosts.find((p) => p.slug === slug);
}
