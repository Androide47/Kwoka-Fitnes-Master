import { Link } from "react-router-dom";
import { getMemberSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  const session = getMemberSession();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-2">Your dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back{session?.email ? `, ${session.email}` : ""}.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">No orders yet—browse the store when you are ready.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/store">Go to store</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Update your details and preferences.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">Account settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
