import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactApi } from "@/lib/api/contactApi";
import { toast } from "sonner";

const ContactEmail = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error("Email and message are required.");
      return;
    }
    contactApi.submitContact({ name, email, message });
    toast.success("Message captured for demo—we will not send real email.");
    setMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <h1 className="font-display text-3xl md:text-4xl mb-2">Contact</h1>
      <p className="text-muted-foreground mb-8">
        Questions about programs or partnerships? Send us a note. For technical problems, use{" "}
        <Link to="/contact/issue" className="text-white hover:underline">
          report an issue
        </Link>
        .
      </p>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Email us</CardTitle>
          <CardDescription>We typically respond within two business days.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ct-name">Name</Label>
              <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ct-email">Email</Label>
              <Input
                id="ct-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ct-msg">Message</Label>
              <Textarea
                id="ct-msg"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
              Send message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactEmail;
