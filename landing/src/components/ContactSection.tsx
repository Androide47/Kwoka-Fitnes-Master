import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ContactSection = () => (
  <section id="contact-home" className="py-20 md:py-28 border-t border-border">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h2 className="font-display text-3xl md:text-4xl mb-4">Get in touch</h2>
        <p className="text-muted-foreground">
          Questions about training, the app, or partnerships? Reach out—or report a problem if something
          is not working.
        </p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-secondary/15 p-4 text-white">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg">General contact</h3>
            <p className="text-sm text-muted-foreground">Email the team for general inquiries.</p>
            <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
              <Link to="/contact">Open contact form</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-secondary/15 p-4 text-white">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg">Report an issue</h3>
            <p className="text-sm text-muted-foreground">Something broken? Tell us what happened.</p>
            <Button asChild variant="outline">
              <Link to="/contact/issue">Report an issue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

export default ContactSection;
