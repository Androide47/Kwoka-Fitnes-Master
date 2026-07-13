import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { mockPosts, type BlogPost } from "@/data/mockBlog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const TrainerBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState("");

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    const slug = slugify(title) || `post-${Date.now()}`;
    const next: BlogPost = {
      slug,
      title: title.trim(),
      excerpt: subTitle.trim() || body.trim().slice(0, 120),
      date: new Date().toISOString().slice(0, 10),
      readTime: `${Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200))} min`,
      body: body.trim(),
      comments: [],
    };
    setPosts((prev) => [next, ...prev]);
    setTitle("");
    setSubTitle("");
    setBody("");
    setCover("");
    toast.success("Blog post saved locally (demo).");
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Create and manage posts for the public blog — demo storage only.
        </p>
      </div>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">New post</CardTitle>
          <CardDescription>
            Fields mirror the drawio Blog table: title, sub_title, body, cover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-sub">Sub title</Label>
              <Input
                id="blog-sub"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="Short subtitle / excerpt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-body">Body</Label>
              <Textarea
                id="blog-body"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the post…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-cover">Cover (URL or note)</Label>
              <Input
                id="blog-cover"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Optional cover image URL"
              />
            </div>
            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
              Publish (demo)
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Posts</CardTitle>
          <CardDescription>Appears on the public /blog page when using shared mock data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-display text-sm tracking-wide">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {post.date} · {post.readTime} · {post.comments.length} comments
                </p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{post.slug}</Badge>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                    View
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerBlog;
