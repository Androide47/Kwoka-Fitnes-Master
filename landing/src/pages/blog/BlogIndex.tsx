import { Link } from "react-router-dom";
import { mockPosts } from "@/data/mockBlog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BlogIndex = () => (
  <div className="container mx-auto px-4 py-10 max-w-3xl">
    <h1 className="font-display text-3xl md:text-4xl mb-2">Blog</h1>
    <p className="text-muted-foreground mb-10">Training, recovery, and mindset—short reads for busy athletes.</p>
    <div className="space-y-6">
      {mockPosts.map((post) => (
        <Card key={post.slug} className="bg-card/80 border-border hover:border-secondary/40 transition-colors">
          <CardHeader>
            <p className="text-xs text-muted-foreground mb-1">
              {post.date} · {post.readTime} read
            </p>
            <CardTitle className="font-display text-xl">
              <Link to={`/blog/${post.slug}`} className="hover:text-white transition-colors">
                {post.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
            <Link
              to={`/blog/${post.slug}`}
              className="text-sm font-medium text-white hover:underline"
            >
              Read post
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default BlogIndex;
