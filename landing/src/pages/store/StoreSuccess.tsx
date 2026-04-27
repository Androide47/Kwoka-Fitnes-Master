import { Link, useSearchParams } from "react-router-dom";
import { getOrder } from "@/lib/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StoreSuccess = () => {
  const [params] = useSearchParams();
  const order = getOrder(params.get("order") ?? "");

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl mb-2">Order received</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Demo checkout complete. No payment was processed.
      </p>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!order ? (
            <p className="text-sm text-muted-foreground">Order details are unavailable in this browser.</p>
          ) : (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Order</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {order.lines.map((line) => (
                  <li key={line.productId} className="flex justify-between gap-4">
                    <span>
                      {line.name} x {line.qty}
                    </span>
                    <span>${(line.unitPrice * line.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border pt-3 font-semibold">Total ${order.total.toFixed(2)}</p>
              {order.sessionCreditsGranted > 0 && (
                <p className="text-sm text-muted-foreground">
                  {order.sessionCreditsGranted} demo session credits were added to {order.customerEmail}.
                </p>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/store">Back to store</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreSuccess;
