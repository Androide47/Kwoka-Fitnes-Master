import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostBySlug } from "@/data/mockBlog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import NotFound from "@/pages/NotFound";

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const [commentDraft, setCommentDraft] = useState("");

  if (!post) {
    return <NotFound />;
  }

  const handleComment = (e: FormEvent) => {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    toast.success("Comment saved locally for demo only.");
    setCommentDraft("");
  };

  return (
    <article className="container mx-auto px-4 py-10 max-w-3xl">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-white mb-6 inline-block">
        ← All posts
      </Link>
      <header className="mb-8">
        <p className="text-xs text-muted-foreground mb-2">
          {post.date} · {post.readTime} read
        </p>
        <h1 className="font-display text-3xl md:text-4xl">{post.title}</h1>
      </header>
      <div className="max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-line mb-12">
        {post.body}
      </div>

      <section className="border-t border-border pt-10">
        <h2 className="font-display text-xl mb-6">Comments</h2>
        <div className="space-y-4 mb-8">
          {post.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            post.comments.map((c) => (
              <Card key={c.id} className="bg-card/60">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-foreground">{c.author}</CardTitle>
                  <p className="text-xs text-muted-foreground">{c.at}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm">{c.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <form onSubmit={handleComment} className="space-y-3">
          <Textarea
            placeholder="Add a comment (demo—does not persist)"
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            rows={3}
          />
          <Button type="submit" variant="secondary" size="sm">
            Post comment
          </Button>
        </form>
      </section>
    </article>
  );
};

export default BlogPost;
