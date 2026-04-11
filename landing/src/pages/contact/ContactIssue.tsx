import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ContactIssue = () => {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !category || !details.trim()) {
      toast.error("Please complete all fields.");
      return;
    }
    toast.success("Issue report recorded for demo only.");
    setDetails("");
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <Link to="/contact" className="text-sm text-muted-foreground hover:text-white mb-6 inline-block">
        ← General contact
      </Link>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Report an issue</h1>
      <p className="text-muted-foreground mb-8">
        Something broken in the app or your order? Tell us what happened.
      </p>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Support ticket (demo)</CardTitle>
          <CardDescription>No ticket is created on a server—this is a UI preview.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iss-email">Your email</Label>
              <Input
                id="iss-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">App / website</SelectItem>
                  <SelectItem value="order">Order or payment</SelectItem>
                  <SelectItem value="account">Account access</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="iss-details">What went wrong?</Label>
              <Textarea
                id="iss-details"
                required
                rows={6}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Steps to reproduce, error messages, device…"
              />
            </div>
            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
              Submit report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactIssue;
